import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed, DollarSign, ShoppingBag, Star } from "lucide-react";

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [restaurantFormData, setRestaurantFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    delivery_available: true,
  });

  const [menuFormData, setMenuFormData] = useState({
    item_name: "",
    description: "",
    price: 0,
    category: "",
    calories: 0,
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
      const [restaurantsRes, bookingsRes, notificationsRes] = await Promise.all([
        supabase.from("restaurant_partners").select("*").eq("partner_id", partnerId),
        supabase.from("partner_bookings").select("*").eq("partner_type", "restaurant").eq("partner_id", partnerId),
        supabase.from("partner_notifications").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(10),
      ]);

      if (restaurantsRes.data) {
        setRestaurants(restaurantsRes.data);
        if (restaurantsRes.data.length > 0) {
          const menuRes = await supabase.from("menu_items").select("*").eq("restaurant_id", restaurantsRes.data[0].id);
          if (menuRes.data) setMenuItems(menuRes.data);
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

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("restaurant_partners").insert({
        ...restaurantFormData,
        partner_id: user.id,
        location: { latitude: 0, longitude: 0 },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Restaurant added successfully" });
      loadDashboardData(user.id);
      setRestaurantFormData({
        name: "",
        email: "",
        phone_number: "",
        address: "",
        city: "",
        state: "",
        delivery_available: true,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurants.length === 0) {
      toast({ title: "Error", description: "Please add a restaurant first", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("menu_items").insert({
        ...menuFormData,
        restaurant_id: restaurants[0].id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Menu item added" });
      loadDashboardData(user.id);
      setMenuFormData({
        item_name: "",
        description: "",
        price: 0,
        category: "",
        calories: 0,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Menu item deleted" });
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
    totalRestaurants: restaurants.length,
    totalMenuItems: menuItems.length,
    pendingOrders: bookings.filter((b) => b.status === "pending").length,
    totalRevenue: bookings.filter((b) => b.payment_status === "completed").reduce((sum, b) => sum + (b.payment_amount || 0), 0),
  };

  return (
    <DashboardLayout
      title="Restaurant Dashboard"
      subtitle="Manage food services and diet plans"
      overviewContent={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
          {restaurants.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Your Restaurant</CardTitle>
                <CardDescription>Enter restaurant details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Restaurant Name</Label>
                      <Input id="name" value={restaurantFormData.name} onChange={(e) => setRestaurantFormData({ ...restaurantFormData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={restaurantFormData.email} onChange={(e) => setRestaurantFormData({ ...restaurantFormData, email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={restaurantFormData.phone_number} onChange={(e) => setRestaurantFormData({ ...restaurantFormData, phone_number: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={restaurantFormData.address} onChange={(e) => setRestaurantFormData({ ...restaurantFormData, address: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={restaurantFormData.city} onChange={(e) => setRestaurantFormData({ ...restaurantFormData, city: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={restaurantFormData.state} onChange={(e) => setRestaurantFormData({ ...restaurantFormData, state: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Restaurant</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {restaurants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item_name">Item Name</Label>
                      <Input id="item_name" value={menuFormData.item_name} onChange={(e) => setMenuFormData({ ...menuFormData, item_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={menuFormData.category} onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" value={menuFormData.price} onChange={(e) => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) })} required />
                    </div>
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input id="calories" type="number" value={menuFormData.calories} onChange={(e) => setMenuFormData({ ...menuFormData, calories: parseInt(e.target.value) })} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={menuFormData.description} onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Menu Item</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {menuItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm">Price: ₹{item.price} | Calories: {item.calories}</p>
                      </div>
                      <Button variant="destructive" onClick={() => handleDeleteMenuItem(item.id)}>Delete</Button>
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
            <CardTitle>Food Orders</CardTitle>
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
              <p><strong>Role:</strong> Restaurant Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
