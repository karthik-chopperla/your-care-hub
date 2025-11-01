import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, Hospital, Stethoscope, Ambulance, Pill, DollarSign, Utensils, Brain, Baby, Dumbbell, Shield } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";

const RoleSelection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPartnerTypes, setShowPartnerTypes] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth', { replace: true });
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roles?.role === 'user') {
        navigate('/user-dashboard', { replace: true });
      } else if (roles?.role === 'partner') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('service_type')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.service_type) {
          navigate('/partner-dashboard', { replace: true });
        }
      }
    };
    checkUserRole();
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Session expired. Please login again.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Insert role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: session.user.id, 
          role: role as 'user' | 'partner' | 'admin'
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        toast({
          title: "Error",
          description: roleError.message,
          variant: "destructive"
        });
        return;
      }

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Session expired. Please login again.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Insert partner role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: session.user.id, 
          role: 'partner'
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        toast({
          title: "Error",
          description: roleError.message,
          variant: "destructive"
        });
        return;
      }

      // Update profile with service type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ service_type: serviceType })
        .eq('id', session.user.id);

      if (profileError) {
        toast({
          title: "Error",
          description: profileError.message,
          variant: "destructive"
        });
        return;
      }

      // Map service type to dashboard route
      const dashboardMap: Record<string, string> = {
        'hospital': '/partner/hospital-dashboard',
        'elder_expert': '/partner/elder-advice-dashboard',
        'doctor': '/partner/gynecologist-dashboard',
        'ambulance': '/partner/ambulance-dashboard',
        'pharmacist': '/partner/medical-shop-dashboard',
        'price_comparison': '/partner/medical-shop-dashboard',
        'dietitian': '/partner/restaurant-dashboard',
        'mental_health': '/partner/mental-health-dashboard',
        'pregnancy_care': '/partner/gynecologist-dashboard',
        'fitness': '/partner/fitness-dashboard',
        'insurance': '/partner/insurance-dashboard',
      };

      toast({
        title: "Success",
        description: "Partner account created successfully!"
      });

      navigate(dashboardMap[serviceType] || '/partner-services');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <MobileLayout showNavigation={false}>
      <MobileHeader 
        title={showPartnerTypes ? 'Choose Partner Type' : 'Choose Role'} 
        showBack={showPartnerTypes} 
        showNotifications={false}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {showPartnerTypes ? 'Choose Your Partner Type' : 'Choose Your Role'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {showPartnerTypes ? 'Select the service you will provide' : 'Select how you\'d like to use Health Mate'}
          </p>
        </div>

        {showPartnerTypes ? (
          <div className="space-y-4">
            {partnerTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="mobile-card">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{type.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handlePartnerTypeSelection(type.id)}
                      className="w-full"
                      size="lg"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button 
              onClick={() => setShowPartnerTypes(false)}
              variant="outline" 
              size="lg"
              className="w-full"
            >
              ← Back to Role Selection
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Role */}
            <div className="mobile-card border-2 border-primary/20">
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">User</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Access healthcare services
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Hospital Finder & Cost Comparison</p>
                  <p>• Emergency SOS</p>
                  <p>• Medicine Reminders</p>
                  <p>• Doctor Consultations</p>
                  <p>• Diet Plans & Mental Health</p>
                </div>
                <Button 
                  onClick={() => handleRoleSelection('user')}
                  className="w-full"
                  size="lg"
                >
                  Select User
                </Button>
              </div>
            </div>

            {/* Partner Role */}
            <div className="mobile-card border-2 border-secondary/20">
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-secondary/10 rounded-2xl">
                    <Building2 className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Partner</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provide healthcare services
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Hospital & Clinic Management</p>
                  <p>• Doctor Consultation Services</p>
                  <p>• Emergency Response</p>
                  <p>• Pharmacy & Medicine Supply</p>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default RoleSelection;