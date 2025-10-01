import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, DollarSign, Package, ShoppingCart } from "lucide-react";

export default function MedicalShopDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [shopFormData, setShopFormData] = useState({
    shop_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    license_number: "",
    delivery_available: true,
  });

  const [medicineFormData, setMedicineFormData] = useState({
    medicine_name: "",
    generic_name: "",
    manufacturer: "",
    price: 0,
    stock_quantity: 0,
  });

  useEffect(() => {
    const healthmateUser = localStorage.getItem("healthmate_user");
    if (!healthmateUser) {
      navigate("/auth");
      return;
    }

    const userData = JSON.parse(healthmateUser);
    if (userData.role !== "partner") {
      navigate("/user-dashboard");
      return;
    }

    setUser(userData);
    loadDashboardData(userData.id);
  }, [navigate]);

  const loadDashboardData = async (partnerId: string) => {
    try {
      const [shopsRes, bookingsRes, notificationsRes] = await Promise.all([
        supabase.from("medical_shops").select("*").eq("partner_id", partnerId),
        supabase.from("partner_bookings").select("*").eq("partner_type", "medical_shop").eq("partner_id", partnerId),
        supabase.from("partner_notifications").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(10),
      ]);

      if (shopsRes.data) {
        setShops(shopsRes.data);
        if (shopsRes.data.length > 0) {
          const inventoryRes = await supabase.from("medicine_inventory").select("*").eq("shop_id", shopsRes.data[0].id);
          if (inventoryRes.data) setInventory(inventoryRes.data);
        }
      }
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (notificationsRes.data) setNotifications(notificationsRes.data);
    } catch (error: any) {
      toast({ title: "Error loading data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("medical_shops").insert({
        ...shopFormData,
        partner_id: user.id,
        location: { latitude: 0, longitude: 0 },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Shop added successfully" });
      loadDashboardData(user.id);
      setShopFormData({
        shop_name: "",
        email: "",
        phone_number: "",
        address: "",
        city: "",
        state: "",
        license_number: "",
        delivery_available: true,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shops.length === 0) {
      toast({ title: "Error", description: "Please add a shop first", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("medicine_inventory").insert({
        ...medicineFormData,
        shop_id: shops[0].id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Medicine added to inventory" });
      loadDashboardData(user.id);
      setMedicineFormData({
        medicine_name: "",
        generic_name: "",
        manufacturer: "",
        price: 0,
        stock_quantity: 0,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    try {
      const { error } = await supabase.from("medicine_inventory").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Medicine deleted successfully" });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from("partner_bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Success", description: `Order ${status}` });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!user || isLoading) return null;

  const stats = {
    totalShops: shops.length,
    totalMedicines: inventory.length,
    pendingOrders: bookings.filter((b) => b.status === "pending").length,
    totalRevenue: bookings.filter((b) => b.payment_status === "completed").reduce((sum, b) => sum + (b.payment_amount || 0), 0),
  };

  return (
    <DashboardLayout
      title="Medical Shop Dashboard"
      subtitle="Manage pharmacy and medicine inventory"
      overviewContent={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShops}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicines in Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMedicines}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>
      }
      dataManagerContent={
        <div className="space-y-6">
          {shops.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Your Shop</CardTitle>
                <CardDescription>Enter shop details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShopSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shop_name">Shop Name</Label>
                      <Input id="shop_name" value={shopFormData.shop_name} onChange={(e) => setShopFormData({ ...shopFormData, shop_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={shopFormData.email} onChange={(e) => setShopFormData({ ...shopFormData, email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={shopFormData.phone_number} onChange={(e) => setShopFormData({ ...shopFormData, phone_number: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={shopFormData.address} onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={shopFormData.city} onChange={(e) => setShopFormData({ ...shopFormData, city: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={shopFormData.state} onChange={(e) => setShopFormData({ ...shopFormData, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="license">License Number</Label>
                      <Input id="license" value={shopFormData.license_number} onChange={(e) => setShopFormData({ ...shopFormData, license_number: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Shop</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {shops.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Medicine to Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMedicineSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicine_name">Medicine Name</Label>
                      <Input id="medicine_name" value={medicineFormData.medicine_name} onChange={(e) => setMedicineFormData({ ...medicineFormData, medicine_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="generic_name">Generic Name</Label>
                      <Input id="generic_name" value={medicineFormData.generic_name} onChange={(e) => setMedicineFormData({ ...medicineFormData, generic_name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input id="manufacturer" value={medicineFormData.manufacturer} onChange={(e) => setMedicineFormData({ ...medicineFormData, manufacturer: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" value={medicineFormData.price} onChange={(e) => setMedicineFormData({ ...medicineFormData, price: parseFloat(e.target.value) })} required />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input id="stock" type="number" value={medicineFormData.stock_quantity} onChange={(e) => setMedicineFormData({ ...medicineFormData, stock_quantity: parseInt(e.target.value) })} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Medicine</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {inventory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Medicine Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{med.medicine_name}</p>
                        <p className="text-sm text-muted-foreground">Generic: {med.generic_name}</p>
                        <p className="text-sm">Price: ₹{med.price} | Stock: {med.stock_quantity}</p>
                      </div>
                      <Button variant="destructive" onClick={() => handleDeleteMedicine(med.id)}>Delete</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      }
      bookingsContent={
        <Card>
          <CardHeader>
            <CardTitle>Medicine Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{booking.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
                    <p className="text-sm">Amount: ₹{booking.payment_amount}</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleBookingAction(booking.id, "confirmed")}>Accept</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBookingAction(booking.id, "rejected")}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
      notificationsContent={
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
      profileContent={
        <Card>
          <CardHeader>
            <CardTitle>Partner Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.full_name}</p>
              <p><strong>Phone:</strong> {user.phone_number}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> Medical Shop Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
