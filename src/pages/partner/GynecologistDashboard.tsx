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
import { Calendar, DollarSign, Users, Clock } from "lucide-react";

export default function GynecologistDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [gynecologists, setGynecologists] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    city: "",
    state: "",
    experience_years: 0,
    consultation_fee: 0,
    specialization: [] as string[],
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
      const [gynecologistsRes, bookingsRes, notificationsRes] = await Promise.all([
        supabase.from("gynecologists").select("*").eq("partner_id", partnerId),
        supabase.from("partner_bookings").select("*").eq("partner_type", "gynecologist").eq("partner_id", partnerId),
        supabase.from("partner_notifications").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(10),
      ]);

      if (gynecologistsRes.data) setGynecologists(gynecologistsRes.data);
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
      const { error } = await supabase.from("gynecologists").insert({
        ...formData,
        partner_id: user.id,
        location: { latitude: 0, longitude: 0 },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Gynecologist profile added successfully" });
      loadDashboardData(user.id);
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        city: "",
        state: "",
        experience_years: 0,
        consultation_fee: 0,
        specialization: [],
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("gynecologists").delete().eq("id", id);
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
    totalProfiles: gynecologists.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    totalRevenue: bookings.filter((b) => b.payment_status === "completed").reduce((sum, b) => sum + (b.payment_amount || 0), 0),
    activeAppointments: bookings.filter((b) => b.status === "confirmed").length,
  };

  return (
    <DashboardLayout
      title="Gynecologist Dashboard"
      subtitle="Manage pregnancy care services and appointments"
      overviewContent={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfiles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
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
              <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAppointments}</div>
            </CardContent>
          </Card>
        </div>
      }
      dataManagerContent={
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Profile</CardTitle>
              <CardDescription>Enter gynecologist details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Doctor Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
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
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input id="experience" type="number" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <Label htmlFor="fee">Consultation Fee</Label>
                    <Input id="fee" type="number" value={formData.consultation_fee} onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Profile</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gynecologists.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.city}, {profile.state}</p>
                      <p className="text-sm">Fee: ₹{profile.consultation_fee}</p>
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
            <CardTitle>Appointment Requests</CardTitle>
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
              <p><strong>Role:</strong> Gynecologist Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
