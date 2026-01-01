import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, Users, Bed, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(true);
  const [profile, setProfile] = useState<any>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone_number: "",
    email: "",
    general_beds: 0,
    icu_beds: 0,
    facilities: [] as string[],
    cost_index: "MEDIUM"
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (authLoading) return;
      if (!user) { navigate("/auth"); return; }
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      if (roleData?.role !== 'partner') { navigate("/user-dashboard"); return; }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);
      
      // Get partner record to filter hospitals
      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (partnerData) {
        setPartnerId(partnerData.id);
        loadData(user.id, partnerData.id);
      } else {
        setLoading(false);
      }
    };
    checkUserRole();
  }, [user, authLoading, navigate]);

  const loadData = async (userId: string, partId: string) => {
    setLoading(true);
    await Promise.all([
      loadHospitals(partId),
      loadBookings(userId),
      loadNotifications(userId)
    ]);
    setLoading(false);
  };

  const loadHospitals = async (partId: string) => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("partner_id", partId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading hospitals", variant: "destructive" });
    } else {
      setHospitals(data || []);
    }
  };

  const loadBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("partner_bookings")
      .select("*, user_info(*)")
      .eq("partner_type", "hospital")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading bookings", variant: "destructive" });
    } else {
      setBookings(data || []);
    }
  };

  const loadNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("partner_notifications")
      .select("*")
      .eq("partner_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      toast({ title: "Error loading notifications", variant: "destructive" });
    } else {
      setNotifications(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partnerId) {
      toast({ title: "Partner profile not found", variant: "destructive" });
      return;
    }

    const hospitalData = {
      ...formData,
      partner_id: partnerId,
      location: { lat: 0, lng: 0 },
      coordinates: { lat: 0, lng: 0 }
    };

    if (editingId) {
      const { error } = await supabase
        .from("hospitals")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Error updating hospital", variant: "destructive" });
      } else {
        toast({ title: "Hospital updated successfully" });
        resetForm();
        loadHospitals(partnerId);
      }
    } else {
      const { error } = await supabase
        .from("hospitals")
        .insert([hospitalData]);

      if (error) {
        toast({ title: "Error adding hospital", variant: "destructive" });
      } else {
        toast({ title: "Hospital added successfully" });
        resetForm();
        loadHospitals(partnerId);
      }
    }
  };

  const handleEdit = (hospital: any) => {
    setFormData({
      name: hospital.name,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      phone_number: hospital.phone_number,
      email: hospital.email,
      general_beds: hospital.general_beds,
      icu_beds: hospital.icu_beds,
      facilities: hospital.facilities || [],
      cost_index: hospital.cost_index
    });
    setEditingId(hospital.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!partnerId) return;
    
    const { error } = await supabase
      .from("hospitals")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting hospital", variant: "destructive" });
    } else {
      toast({ title: "Hospital deleted successfully" });
      loadHospitals(partnerId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      phone_number: "",
      email: "",
      general_beds: 0,
      icu_beds: 0,
      facilities: [],
      cost_index: "MEDIUM"
    });
    setEditingId(null);
    setShowForm(false);
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("partner_bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast({ title: "Error updating booking", variant: "destructive" });
    } else {
      toast({ title: `Booking ${status}` });
      loadBookings(user?.id || "");
    }
  };

  // Overview Content
  const overviewContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hospitals.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {bookings.filter(b => b.status === "pending").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hospitals.reduce((sum, h) => sum + (h.general_beds || 0), 0)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{bookings.reduce((sum, b) => sum + (b.payment_amount || 0), 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Data Manager Content
  const dataManagerContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Hospitals</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hospital
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Hospital" : "Add New Hospital"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Hospital Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>General Beds</Label>
                  <Input
                    type="number"
                    value={formData.general_beds}
                    onChange={(e) => setFormData({ ...formData, general_beds: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>ICU Beds</Label>
                  <Input
                    type="number"
                    value={formData.icu_beds}
                    onChange={(e) => setFormData({ ...formData, icu_beds: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Cost Index</Label>
                  <Select value={formData.cost_index} onValueChange={(value) => setFormData({ ...formData, cost_index: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Hospital</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {hospitals.map((hospital) => (
          <Card key={hospital.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{hospital.name}</CardTitle>
                  <CardDescription>{hospital.address}, {hospital.city}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(hospital)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(hospital.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">General Beds</p>
                  <p className="font-semibold">{hospital.general_beds}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ICU Beds</p>
                  <p className="font-semibold">{hospital.icu_beds}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost Index</p>
                  <Badge>{hospital.cost_index}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-semibold">{hospital.phone_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Bookings Content
  const bookingsContent = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Appointment Requests</h2>
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No bookings yet
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{booking.user_info?.full_name}</CardTitle>
                  <CardDescription>{booking.booking_type}</CardDescription>
                </div>
                <Badge>{booking.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Phone:</span> {booking.user_info?.phone_number}
                </p>
                {booking.scheduled_at && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Scheduled:</span>{" "}
                    {new Date(booking.scheduled_at).toLocaleString()}
                  </p>
                )}
                {booking.notes && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Notes:</span> {booking.notes}
                  </p>
                )}
                {booking.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => updateBookingStatus(booking.id, "confirmed")}>
                      Accept
                    </Button>
                    <Button variant="destructive" onClick={() => updateBookingStatus(booking.id, "cancelled")}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  // Notifications Content
  const notificationsContent = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notifications</h2>
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No notifications
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id} className={notification.is_read ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">{notification.title}</CardTitle>
              <CardDescription>{new Date(notification.created_at).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{notification.message}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  // Profile Content
  const profileContent = (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your partner account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Partner Name</Label>
          <Input value={profile?.full_name || ""} disabled />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input value={profile?.phone_number || ""} disabled />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div>
          <Label>Service Type</Label>
          <Input value="Hospital Partner" disabled />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Hospital Partner Dashboard"
      subtitle="Manage your hospital services, appointments, and facilities"
      overviewContent={overviewContent}
      dataManagerContent={dataManagerContent}
      bookingsContent={bookingsContent}
      notificationsContent={notificationsContent}
      profileContent={profileContent}
    />
  );
}
