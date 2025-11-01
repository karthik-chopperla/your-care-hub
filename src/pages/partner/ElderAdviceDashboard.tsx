import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Users, MessageCircle, BookOpen, Star, Send } from "lucide-react";

export default function ElderAdviceDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [experts, setExperts] = useState<any[]>([]);
  const [adviceRequests, setAdviceRequests] = useState<any[]>([]);
  const [remedies, setRemedies] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const [expertForm, setExpertForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    city: "",
    state: "",
    specialty: "",
    experience_years: 0,
    traditional_medicine_type: "",
  });

  const [remedyForm, setRemedyForm] = useState({
    remedy_name: "",
    condition: "",
    ingredients: "",
    preparation_steps: "",
    duration: "",
    safety_notes: ""
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load expert profiles
      const { data: expertsData } = await supabase
        .from("elder_experts")
        .select("*")
        .eq("partner_id", user.id);
      setExperts(expertsData || []);

      // Load advice requests for this expert's profiles
      if (expertsData && expertsData.length > 0) {
        const expertIds = expertsData.map(e => e.id);
        
        const { data: requestsData } = await supabase
          .from("elder_advice_requests")
          .select("*, profiles(full_name, email)")
          .in("elder_id", expertIds)
          .order("created_at", { ascending: false });
        setAdviceRequests(requestsData || []);

        // Load remedies
        const { data: remediesData } = await supabase
          .from("elder_remedies")
          .select("*")
          .in("elder_id", expertIds)
          .order("created_at", { ascending: false });
        setRemedies(remediesData || []);
      }

      // Load notifications
      const { data: notificationsData } = await supabase
        .from("partner_notifications")
        .select("*")
        .eq("partner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(notificationsData || []);
    } catch (error: any) {
      toast({ title: "Error loading data", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from("elder_experts").insert({
        ...expertForm,
        partner_id: user.id,
        location: { city: expertForm.city, state: expertForm.state },
        is_available: true
      });

      if (error) throw error;

      toast({ title: "Success", description: "Expert profile added successfully" });
      loadDashboardData();
      setExpertForm({
        name: "",
        email: "",
        phone_number: "",
        city: "",
        state: "",
        specialty: "",
        experience_years: 0,
        traditional_medicine_type: "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemedySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || experts.length === 0) {
      toast({ title: "Error", description: "Please create an expert profile first", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("elder_remedies").insert({
        elder_id: experts[0].id,
        remedy_name: remedyForm.remedy_name,
        condition: remedyForm.condition,
        ingredients: remedyForm.ingredients.split(",").map(i => i.trim()),
        preparation_steps: remedyForm.preparation_steps,
        duration: remedyForm.duration,
        safety_notes: remedyForm.safety_notes,
        is_verified: true
      });

      if (error) throw error;

      toast({ title: "Success", description: "Remedy published successfully" });
      setRemedyForm({
        remedy_name: "",
        condition: "",
        ingredients: "",
        preparation_steps: "",
        duration: "",
        safety_notes: ""
      });
      loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("elder_experts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Profile deleted successfully" });
      loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReplyToAdvice = async (requestId: string) => {
    const reply = replyText[requestId];
    if (!reply?.trim()) return;

    try {
      const { error } = await supabase
        .from("elder_advice_requests")
        .update({ 
          reply: reply.trim(), 
          status: "answered",
          replied_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: "Success", description: "Reply sent to user" });
      setReplyText(prev => ({ ...prev, [requestId]: "" }));
      loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleAvailability = async (expertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("elder_experts")
        .update({ is_available: !currentStatus })
        .eq("id", expertId);

      if (error) throw error;

      toast({ title: "Success", description: `Status updated to ${!currentStatus ? "Online" : "Offline"}` });
      loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!user) return null;

  const stats = {
    totalExperts: experts.length,
    pendingQuestions: adviceRequests.filter((r) => r.status === "pending").length,
    answeredQuestions: adviceRequests.filter((r) => r.status === "answered").length,
    avgRating: experts.length > 0 ? (experts.reduce((sum, e) => sum + (e.ratings || 0), 0) / experts.length).toFixed(1) : 0,
  };

  return (
    <DashboardLayout
      title="Elder Advice Dashboard"
      subtitle="Share traditional wisdom and health advice"
      overviewContent={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expert Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExperts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Questions</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingQuestions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.answeredQuestions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
            </CardContent>
          </Card>
        </div>
      }
      dataManagerContent={
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Expert Profile</CardTitle>
              <CardDescription>Enter elder advisor details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Expert Name</Label>
                    <Input id="name" value={expertForm.name} onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input id="specialty" value={expertForm.specialty} onChange={(e) => setExpertForm({ ...expertForm, specialty: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={expertForm.email} onChange={(e) => setExpertForm({ ...expertForm, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={expertForm.phone_number} onChange={(e) => setExpertForm({ ...expertForm, phone_number: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={expertForm.city} onChange={(e) => setExpertForm({ ...expertForm, city: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={expertForm.state} onChange={(e) => setExpertForm({ ...expertForm, state: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input id="experience" type="number" value={expertForm.experience_years} onChange={(e) => setExpertForm({ ...expertForm, experience_years: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <Label htmlFor="medicine_type">Traditional Medicine Type</Label>
                    <Input id="medicine_type" value={expertForm.traditional_medicine_type} onChange={(e) => setExpertForm({ ...expertForm, traditional_medicine_type: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Expert Profile</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Expert Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experts.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{profile.name}</p>
                        <Badge variant={profile.is_available ? "default" : "secondary"}>
                          {profile.is_available ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Specialty: {profile.specialty}</p>
                      <p className="text-sm">{profile.city}, {profile.state} | Experience: {profile.experience_years} years</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAvailability(profile.id, profile.is_available)}
                      >
                        Toggle Status
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish Public Remedy</CardTitle>
              <CardDescription>Share your remedies with all users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRemedySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="remedy_name">Remedy Name</Label>
                    <Input 
                      id="remedy_name" 
                      value={remedyForm.remedy_name} 
                      onChange={(e) => setRemedyForm({ ...remedyForm, remedy_name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Input 
                      id="condition" 
                      value={remedyForm.condition} 
                      onChange={(e) => setRemedyForm({ ...remedyForm, condition: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                    <Input 
                      id="ingredients" 
                      value={remedyForm.ingredients} 
                      onChange={(e) => setRemedyForm({ ...remedyForm, ingredients: e.target.value })} 
                      placeholder="Ginger, Honey, Warm water"
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="preparation_steps">Preparation Steps</Label>
                    <Textarea 
                      id="preparation_steps" 
                      value={remedyForm.preparation_steps} 
                      onChange={(e) => setRemedyForm({ ...remedyForm, preparation_steps: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input 
                      id="duration" 
                      value={remedyForm.duration} 
                      onChange={(e) => setRemedyForm({ ...remedyForm, duration: e.target.value })} 
                      placeholder="3-5 days"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="safety_notes">Safety Notes</Label>
                    <Input 
                      id="safety_notes" 
                      value={remedyForm.safety_notes} 
                      onChange={(e) => setRemedyForm({ ...remedyForm, safety_notes: e.target.value })} 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Publish Remedy</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published Remedies ({remedies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {remedies.map((remedy) => (
                    <div key={remedy.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold">{remedy.remedy_name}</h4>
                      <p className="text-sm text-muted-foreground">For: {remedy.condition}</p>
                      <p className="text-xs mt-1">Duration: {remedy.duration}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      }
      bookingsContent={
        <Card>
          <CardHeader>
            <CardTitle>Advice Requests ({adviceRequests.length})</CardTitle>
            <CardDescription>Answer user questions privately</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {adviceRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">From: {request.profiles?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{request.profiles?.email}</p>
                      </div>
                      <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-semibold mb-1">Question:</p>
                      <p className="text-sm">{request.question}</p>
                    </div>

                    {request.status === "pending" && (
                      <div className="space-y-2">
                        <Label htmlFor={`reply-${request.id}`}>Your Reply</Label>
                        <Textarea
                          id={`reply-${request.id}`}
                          value={replyText[request.id] || ""}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [request.id]: e.target.value }))}
                          placeholder="Type your advice here..."
                          rows={3}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleReplyToAdvice(request.id)}
                          disabled={!replyText[request.id]?.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    )}

                    {request.reply && (
                      <div className="p-3 bg-primary/5 rounded-md">
                        <p className="text-sm font-semibold mb-1">Your Reply:</p>
                        <p className="text-sm">{request.reply}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Sent on {new Date(request.replied_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Asked on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {adviceRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No advice requests yet</p>
                )}
              </div>
            </ScrollArea>
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
              {notifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No notifications yet</p>
              )}
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
              <p><strong>Name:</strong> {user.user_metadata?.full_name || "N/A"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> Elder Advice Partner</p>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
