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
import { Shield, DollarSign, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function InsuranceDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth(true);
  const [profile, setProfile] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [partnerFormData, setPartnerFormData] = useState({
    company_name: "",
    agent_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    license_number: "",
  });

  const [planFormData, setPlanFormData] = useState({
    plan_name: "",
    coverage_amount: 0,
    premium_monthly: 0,
    eligibility_criteria: "",
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
      const [partnersRes, bookingsRes, notificationsRes] = await Promise.all([
        supabase.from("insurance_partners").select("*").eq("partner_id", partnerId),
        supabase.from("partner_bookings").select("*").eq("partner_type", "insurance").eq("partner_id", partnerId),
        supabase.from("partner_notifications").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(10),
      ]);

      if (partnersRes.data) {
        setPartners(partnersRes.data);
        if (partnersRes.data.length > 0) {
          const plansRes = await supabase.from("insurance_plans").select("*").eq("partner_id", partnersRes.data[0].id);
          if (plansRes.data) setPlans(plansRes.data);
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

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from("insurance_partners").insert({
        ...partnerFormData,
        partner_id: user.id,
        location: { latitude: 0, longitude: 0 },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Company profile added successfully" });
      loadDashboardData(user.id);
      setPartnerFormData({
        company_name: "",
        agent_name: "",
        email: "",
        phone_number: "",
        address: "",
        city: "",
        state: "",
        license_number: "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (partners.length === 0) {
      toast({ title: "Error", description: "Please add company profile first", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("insurance_plans").insert({
        ...planFormData,
        partner_id: partners[0].id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Insurance plan added" });
      loadDashboardData(user.id);
      setPlanFormData({
        plan_name: "",
        coverage_amount: 0,
        premium_monthly: 0,
        eligibility_criteria: "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const { error } = await supabase.from("insurance_plans").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Plan deleted successfully" });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from("partner_bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Success", description: `Claim ${status}` });
      loadDashboardData(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!user || isLoading) return null;

  const stats = {
    totalCompanies: partners.length,
    totalPlans: plans.length,
    pendingClaims: bookings.filter((b) => b.status === "pending").length,
    totalRevenue: bookings.filter((b) => b.payment_status === "completed").reduce((sum, b) => sum + (b.payment_amount || 0), 0),
  };

  return (
    <DashboardLayout
      title="Insurance Dashboard"
      subtitle="Manage insurance plans and claims"
      overviewContent={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingClaims}</div>
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
          {partners.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Company Profile</CardTitle>
                <CardDescription>Enter insurance company details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePartnerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input id="company_name" value={partnerFormData.company_name} onChange={(e) => setPartnerFormData({ ...partnerFormData, company_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="agent_name">Agent Name</Label>
                      <Input id="agent_name" value={partnerFormData.agent_name} onChange={(e) => setPartnerFormData({ ...partnerFormData, agent_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={partnerFormData.email} onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={partnerFormData.phone_number} onChange={(e) => setPartnerFormData({ ...partnerFormData, phone_number: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={partnerFormData.address} onChange={(e) => setPartnerFormData({ ...partnerFormData, address: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={partnerFormData.city} onChange={(e) => setPartnerFormData({ ...partnerFormData, city: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={partnerFormData.state} onChange={(e) => setPartnerFormData({ ...partnerFormData, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="license">License Number</Label>
                      <Input id="license" value={partnerFormData.license_number} onChange={(e) => setPartnerFormData({ ...partnerFormData, license_number: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Company</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {partners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Insurance Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlanSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan_name">Plan Name</Label>
                      <Input id="plan_name" value={planFormData.plan_name} onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="coverage">Coverage Amount</Label>
                      <Input id="coverage" type="number" value={planFormData.coverage_amount} onChange={(e) => setPlanFormData({ ...planFormData, coverage_amount: parseFloat(e.target.value) })} required />
                    </div>
                    <div>
                      <Label htmlFor="premium">Monthly Premium</Label>
                      <Input id="premium" type="number" value={planFormData.premium_monthly} onChange={(e) => setPlanFormData({ ...planFormData, premium_monthly: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="eligibility">Eligibility Criteria</Label>
                      <Textarea id="eligibility" value={planFormData.eligibility_criteria} onChange={(e) => setPlanFormData({ ...planFormData, eligibility_criteria: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Plan</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {plans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Insurance Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{plan.plan_name}</p>
                        <p className="text-sm text-muted-foreground">Coverage: ₹{plan.coverage_amount}</p>
                        <p className="text-sm">Premium: ₹{plan.premium_monthly}/month</p>
                      </div>
                      <Button variant="destructive" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
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
            <CardTitle>Claim Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Claim #{booking.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
                    <p className="text-sm">Amount: ₹{booking.payment_amount}</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleBookingAction(booking.id, "confirmed")}>Approve</Button>
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
              <p><strong>Role:</strong> Insurance Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
