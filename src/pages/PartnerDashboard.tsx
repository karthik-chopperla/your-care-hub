import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Users, BarChart3, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PartnerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!profileData?.role) {
        navigate('/role-selection');
        return;
      }

      if (profileData.role !== 'partner') {
        navigate('/user-dashboard');
        return;
      }

      setProfile(profileData);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
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
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-hero">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">HealthMate Partner</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || profile?.email || profile?.phone_number}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome back, Dr. {profile?.full_name?.split(' ')[0] || 'Partner'}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your practice and help patients
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-strong border-border/50">
              <CardHeader className="text-center space-y-2">
                <div className="p-3 rounded-xl bg-wellness/10 mx-auto w-fit">
                  <Calendar className="h-6 w-6 text-wellness" />
                </div>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Today's Appointments</CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-strong border-border/50">
              <CardHeader className="text-center space-y-2">
                <div className="p-3 rounded-xl bg-primary/10 mx-auto w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Total Patients</CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-strong border-border/50">
              <CardHeader className="text-center space-y-2">
                <div className="p-3 rounded-xl bg-urgent/10 mx-auto w-fit">
                  <BarChart3 className="h-6 w-6 text-urgent" />
                </div>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Monthly Revenue</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-strong border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center space-y-4">
                <div className="p-4 rounded-xl bg-wellness/10 mx-auto w-fit group-hover:bg-wellness/20 transition-colors">
                  <Calendar className="h-8 w-8 text-wellness" />
                </div>
                <CardTitle>Manage Appointments</CardTitle>
                <CardDescription>
                  View and manage patient appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="wellness" onClick={() => navigate('/partner/appointments')}>
                  View Schedule
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-strong border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 mx-auto w-fit group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Patient Records</CardTitle>
                <CardDescription>
                  Access and manage patient information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="hero" onClick={() => navigate('/partner/patients')}>
                  View Patients
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-strong border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center space-y-4">
                <div className="p-4 rounded-xl bg-urgent/10 mx-auto w-fit group-hover:bg-urgent/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-urgent" />
                </div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View practice insights and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => navigate('/partner/analytics')}>
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="shadow-strong border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest practice updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity found.</p>
                <p className="text-sm">Start by setting up your practice profile.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}