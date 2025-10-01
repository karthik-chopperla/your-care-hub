import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, Users, Activity } from "lucide-react";

export default function HomeNursingDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    agency_name: "",
    email: "",
    phone_number: "",
    city: "",
    state: "",
    available_nurses: 0,
    service_radius: 10,
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
      const [partnersRes, bookingsRes, notificationsRes] = await Promise.all([
        supabase.from("home_nursing_partners").select("*").eq("partner_id", partnerId),
        supabase.from("partner_bookings").select("*").eq("partner_type", "home_nursing").eq("partner_id", partnerId),
        supabase.from("partner_notifications").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(10),
      ]);

      if (partnersRes.data) setPartners(partnersRes.data);
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
    try {
      const { error } = await supabase.from("home_nursing_partners").insert({
        ...formData,
        partner_id: user.id,
        location: { latitude: 0, longitude: 0 },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Agency profile added successfully" });
      loadDashboardData(user.id);
      setFormData({
        agency_name: "",
        email: "",
        phone_number: "",
        city: "",
        state: "",
        available_nurses: 0,
        service_radius: 10,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("home_nursing_partners").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Profile deleted successfully" });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from("partner_bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Success", description: `Booking ${status}` });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!user || isLoading) return null;

  const stats = {
    totalAgencies: partners.length,
    pendingRequests: bookings.filter((b) => b.status === "pending").length,
    totalRevenue: bookings.filter((b) => b.payment_status === "completed").reduce((sum, b) => sum + (b.payment_amount || 0), 0),
    activeServices: bookings.filter((b) => b.status === "confirmed").length,
  };

  return (
    <DashboardLayout
      title="Home Nursing Dashboard"
      subtitle="Manage home nursing services"
      overviewContent={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAgencies}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
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
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeServices}</div>
            </CardContent>
          </Card>
        </div>
      }
      dataManagerContent={
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Agency</CardTitle>
              <CardDescription>Enter nursing agency details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agency_name">Agency Name</Label>
                    <Input id="agency_name" value={formData.agency_name} onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
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
                    <Label htmlFor="nurses">Available Nurses</Label>
                    <Input id="nurses" type="number" value={formData.available_nurses} onChange={(e) => setFormData({ ...formData, available_nurses: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <Label htmlFor="radius">Service Radius (km)</Label>
                    <Input id="radius" type="number" value={formData.service_radius} onChange={(e) => setFormData({ ...formData, service_radius: parseInt(e.target.value) })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Agency</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Agencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partners.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{profile.agency_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.city}, {profile.state}</p>
                      <p className="text-sm">Nurses: {profile.available_nurses} | Radius: {profile.service_radius}km</p>
                    </div>
                    <Button variant="destructive" onClick={() => handleDelete(profile.id)}>Delete</Button>
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
            <CardTitle>Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Booking #{booking.id.slice(0, 8)}</p>
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
              <p><strong>Role:</strong> Home Nursing Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
