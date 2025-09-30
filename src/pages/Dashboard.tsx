import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  Stethoscope, 
  MapPin, 
  Pill,
  Phone,
  User,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setProfile(profileData);
      } else {
        navigate('/auth');
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "Successfully signed out",
      });
      navigate('/');
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: "Symptom Checker",
      description: "AI-powered health assessment",
      variant: "medical" as const,
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Appointment",
      description: "Find and book with doctors",
      variant: "default" as const,
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "SOS Emergency",
      description: "Emergency assistance",
      variant: "urgent" as const,
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Find Hospitals",
      description: "Nearby healthcare facilities",
      variant: "wellness" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-hero">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Health Mate</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-xl p-6 text-white shadow-medium">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {profile.full_name || user.email}!
          </h1>
          <p className="text-white/90">
            Your health journey continues here. How can we help you today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-medium transition-all duration-normal hover:-translate-y-1 border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <Button variant="outline" className="mt-4">
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medicine Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No medicine reminders set</p>
                <Button variant="outline" className="mt-4">
                  Add Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center shadow-soft border-border/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <p className="text-sm text-muted-foreground">Consultations This Month</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-border/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-2">0</div>
              <p className="text-sm text-muted-foreground">Health Reports</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-border/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-urgent mb-2">0</div>
              <p className="text-sm text-muted-foreground">Emergency Contacts</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}