import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, Hospital, Stethoscope, Ambulance, Pill, DollarSign, Utensils, Brain, Baby, Dumbbell, Shield } from "lucide-react";

const RoleSelection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPartnerTypes, setShowPartnerTypes] = useState(false);

  useEffect(() => {
    // Check if user has already selected a role
    const userInfo = localStorage.getItem('healthmate_user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role === 'user') {
        navigate('/user-dashboard', { replace: true });
      } else if (user.role === 'partner' && user.service_type) {
        navigate('/partner-dashboard', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const partnerTypes = [
    { id: 'hospital', name: 'Hospital Partner', icon: Hospital, description: 'Manage hospital info, beds, costs' },
    { id: 'elder_expert', name: 'Elder Expert', icon: Users, description: 'Traditional advice & guidance' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, description: 'Consultations & appointments' },
    { id: 'ambulance', name: 'Emergency Services', icon: Ambulance, description: 'SOS alerts & response' },
    { id: 'pharmacist', name: 'Pharmacist', icon: Pill, description: 'Medicine catalog & reminders' },
    { id: 'price_comparison', name: 'Price Comparison', icon: DollarSign, description: 'Medicine pricing updates' },
    { id: 'dietitian', name: 'Dietitian/Food Provider', icon: Utensils, description: 'Diet plans & meal orders' },
    { id: 'mental_health', name: 'Mental Health', icon: Brain, description: 'Sessions & nursing care' },
    { id: 'pregnancy_care', name: 'Pregnancy Care', icon: Baby, description: 'Care guidance & checkups' },
    { id: 'fitness', name: 'Fitness Partner', icon: Dumbbell, description: 'Workout sessions & tracking' },
    { id: 'insurance', name: 'Insurance Partner', icon: Shield, description: 'Policies & claims management' },
  ];

  const handleRoleSelection = async (role: 'user' | 'partner') => {
    if (role === 'partner') {
      setShowPartnerTypes(true);
      return;
    }

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

      const updatedUser = { ...user, role };
      localStorage.setItem('healthmate_user', JSON.stringify(updatedUser));

      toast({
        title: "Success",
        description: `Welcome! You've selected the ${role} role.`
      });

      navigate('/user-dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handlePartnerTypeSelection = async (serviceType: string) => {
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
      
      const { error } = await supabase
        .from('user_info')
        .update({ role: 'partner', service_type: serviceType })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const updatedUser = { ...user, role: 'partner', service_type: serviceType };
      localStorage.setItem('healthmate_user', JSON.stringify(updatedUser));

      toast({
        title: "Success",
        description: "Partner account created successfully!"
      });

      navigate('/partner-services');
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
      <div className="container flex min-h-screen items-center justify-center py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-center space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {showPartnerTypes ? 'Choose Your Partner Type' : 'Choose Your Role'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {showPartnerTypes ? 'Select the service you will provide' : 'Select how you\'d like to use HealthMate'}
            </p>
          </div>

          {showPartnerTypes ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {partnerTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <CardDescription className="text-sm">{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handlePartnerTypeSelection(type.id)}
                        className="w-full"
                      >
                        Select
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="pt-6">
                  <Button 
                    onClick={() => setShowPartnerTypes(false)}
                    variant="outline" 
                    className="w-full"
                  >
                    ← Back to Role Selection
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;