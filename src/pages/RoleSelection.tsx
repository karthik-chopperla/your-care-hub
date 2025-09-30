import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function RoleSelection() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user already has a role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.role) {
        // User already has a role, redirect to appropriate dashboard
        if (profile.role === 'user') {
          navigate('/user-dashboard');
        } else if (profile.role === 'partner') {
          navigate('/partner-dashboard');
        }
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleRoleSelection = async (role: string) => {
    setIsLoading(true);
    setSelectedRole(role);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const { error } = await supabase.rpc('set_user_role', {
        user_uuid: session.user.id,
        new_role: role
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Role Selected",
        description: `Welcome to HealthMate as a ${role}!`,
      });

      // Redirect to appropriate dashboard
      if (role === 'user') {
        navigate('/user-dashboard');
      } else if (role === 'partner') {
        navigate('/partner-dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set role. Please try again.",
        variant: "destructive",
      });
      console.error('Role selection error:', error);
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-xl bg-gradient-hero shadow-medium">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-3xl font-bold text-foreground">HealthMate</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Choose Your Role</h1>
            <p className="text-xl text-muted-foreground">
              Are you a User looking for health services or a Partner providing them?
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Role Card */}
          <Card className="shadow-strong border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-wellness/10 mx-auto w-fit group-hover:bg-wellness/20 transition-colors">
                <Users className="h-12 w-12 text-wellness" />
              </div>
              <CardTitle className="text-2xl font-bold">I'm a User</CardTitle>
              <CardDescription className="text-lg">
                Looking for health services, consultations, and wellness support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-wellness rounded-full"></div>
                  Book appointments with doctors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-wellness rounded-full"></div>
                  Access symptom checker
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-wellness rounded-full"></div>
                  Manage medicine reminders
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-wellness rounded-full"></div>
                  Track health records
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant="wellness"
                onClick={() => handleRoleSelection('user')}
                disabled={isLoading}
              >
                {isLoading && selectedRole === 'user' ? "Setting up..." : "Continue as User"}
              </Button>
            </CardContent>
          </Card>

          {/* Partner Role Card */}
          <Card className="shadow-strong border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 mx-auto w-fit group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">I'm a Partner</CardTitle>
              <CardDescription className="text-lg">
                Healthcare provider offering services to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Manage your practice
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  View and manage appointments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Access patient consultations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Analytics and insights
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant="hero"
                onClick={() => handleRoleSelection('partner')}
                disabled={isLoading}
              >
                {isLoading && selectedRole === 'partner' ? "Setting up..." : "Continue as Partner"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}