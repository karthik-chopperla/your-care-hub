import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ambulance, DollarSign, AlertCircle, CheckCircle, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth(true);
  const [profile, setProfile] = useState<any>(null);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    vehicle_number: "",
    driver_name: "",
    phone_number: "",
    city: "",
    state: "",
    vehicle_type: "",
    license_number: "",
    service_radius: 50,
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (loading) return;
      if (!user) { navigate("/auth"); return; }
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      if (roleData?.role !== 'partner') { navigate("/user-dashboard"); return; }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);
      loadDashboardData(user.id);
    };
    checkUserRole();
  }, [user, loading, navigate]);

  const loadDashboardData = async (partnerId: string) => {
    try {
      const [ambulancesRes, bookingsRes, notificationsRes] = await Promise.all([
        supabase.from("ambulance_partners").select("*").eq("partner_id", partnerId),
        supabase.from("partner_bookings").select("*").eq("partner_type", "ambulance").eq("partner_id", partnerId),
        supabase.from("partner_notifications").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(10),
      ]);

      if (ambulancesRes.data) setAmbulances(ambulancesRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (notificationsRes.data) setNotifications(notificationsRes.data);
    } catch (error: any) {
      toast({ title: "Error loading data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from("ambulance_partners").insert({
        ...formData,
        partner_id: user.id,
        location: { latitude: 0, longitude: 0 },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Ambulance added successfully" });
      loadDashboardData(user.id);
      setFormData({
        vehicle_number: "",
        driver_name: "",
        phone_number: "",
        city: "",
        state: "",
        vehicle_type: "",
        license_number: "",
        service_radius: 50,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("ambulance_partners").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Ambulance deleted successfully" });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from("partner_bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Success", description: `SOS ${status}` });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!user || isLoading) return null;

  const stats = {
    totalVehicles: ambulances.length,
    activeSOS: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings.filter((b) => b.payment_status === "completed").reduce((sum, b) => sum + (b.payment_amount || 0), 0),
    completedCases: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <DashboardLayout
      title="Emergency SOS Dashboard"
      subtitle="Manage ambulance services and SOS requests"
      overviewContent={
        <div className="space-y-6">
          {/* SOS Alerts Button - Prominent */}
          <Card className="border-destructive/50 bg-gradient-to-r from-destructive/10 to-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                    <Bell className="h-7 w-7 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-destructive">SOS Alerts Center</h3>
                    <p className="text-sm text-muted-foreground">View and respond to emergency requests</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => navigate('/partner/sos-alerts')}
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  View SOS Alerts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Ambulance className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active SOS</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSOS}</div>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Cases</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedCases}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      dataManagerContent={
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Ambulance</CardTitle>
              <CardDescription>Enter vehicle and driver details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_number">Vehicle Number</Label>
                    <Input id="vehicle_number" value={formData.vehicle_number} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="driver_name">Driver Name</Label>
                    <Input id="driver_name" value={formData.driver_name} onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Input id="vehicle_type" value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="license">License Number</Label>
                    <Input id="license" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="radius">Service Radius (km)</Label>
                    <Input id="radius" type="number" value={formData.service_radius} onChange={(e) => setFormData({ ...formData, service_radius: parseInt(e.target.value) })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Ambulance</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Ambulances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ambulances.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{vehicle.vehicle_number}</p>
                      <p className="text-sm text-muted-foreground">Driver: {vehicle.driver_name}</p>
                      <p className="text-sm">{vehicle.city}, {vehicle.state} | Radius: {vehicle.service_radius}km</p>
                    </div>
                    <Button variant="destructive" onClick={() => handleDelete(vehicle.id)}>Delete</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      }
      bookingsContent={
        <Card>
          <CardHeader>
            <CardTitle>SOS Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">SOS #{booking.id.slice(0, 8)}</p>
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
              <p><strong>Name:</strong> {profile?.full_name || 'N/A'}</p>
              <p><strong>Phone:</strong> {profile?.phone_number || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> Emergency SOS Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
