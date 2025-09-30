import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2 } from "lucide-react";

const RoleSelection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRoleSelection = async (role: 'user' | 'partner') => {
    try {
      const userInfo = localStorage.getItem('healthmate_user');
      if (!userInfo) {
        toast({
          title: "Error",
          description: "User information not found. Please register again.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const user = JSON.parse(userInfo);
      
      // Update role in database
      const { error } = await supabase
        .from('user_info')
        .update({ role })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Update local storage
      const updatedUser = { ...user, role };
      localStorage.setItem('healthmate_user', JSON.stringify(updatedUser));

      toast({
        title: "Success",
        description: `Welcome! You've selected the ${role} role.`
      });

      // Navigate to appropriate dashboard
      navigate(role === 'user' ? '/user-dashboard' : '/partner-dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container flex min-h-screen items-center justify-center">
        <div className="mx-auto flex w-full max-w-2xl flex-col justify-center space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Choose Your Role
            </h1>
            <p className="text-lg text-muted-foreground">
              Select how you'd like to use HealthMate
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Role */}
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">User</CardTitle>
                <CardDescription className="text-sm">
                  Access healthcare services and manage your health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Hospital Finder & Cost Comparison</p>
                  <p>• Emergency SOS</p>
                  <p>• Medicine Reminders</p>
                  <p>• Doctor Consultations</p>
                  <p>• Diet Plans & Mental Health</p>
                  <p>• Pregnancy & Fitness Support</p>
                </div>
                <Button 
                  onClick={() => handleRoleSelection('user')}
                  className="w-full"
                  size="lg"
                >
                  Select User
                </Button>
              </CardContent>
            </Card>

            {/* Partner Role */}
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-secondary/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                  <Building2 className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Partner</CardTitle>
                <CardDescription className="text-sm">
                  Provide healthcare services and manage your practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Hospital & Clinic Management</p>
                  <p>• Doctor Consultation Services</p>
                  <p>• Emergency Response (Ambulance)</p>
                  <p>• Pharmacy & Medicine Supply</p>
                  <p>• Diet & Mental Health Services</p>
                  <p>• Specialized Care Programs</p>
                </div>
                <Button 
                  onClick={() => handleRoleSelection('partner')}
                  className="w-full"
                  variant="secondary"
                  size="lg"
                >
                  Select Partner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;