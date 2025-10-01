import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CountrySelector } from "@/components/CountrySelector";
import { countries } from "@/data/countries";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch user info to check role
        const { data: userInfo } = await supabase
          .from('user_info')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userInfo) {
          if (userInfo.role === 'user') {
            navigate('/user-dashboard', { replace: true });
          } else if (userInfo.role === 'partner') {
            navigate('/partner-dashboard', { replace: true });
          } else {
            navigate('/role-selection', { replace: true });
          }
        }
      }
    };
    checkAuth();
  }, [navigate]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    countryCode: '+1',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a temporary email from phone number for authentication
      const email = `${formData.countryCode}${formData.phone}@healthmate.app`;

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
            country_code: formData.countryCode,
          }
        }
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        // Create user profile in user_info table
        const { error: profileError } = await supabase
          .from('user_info')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            phone_number: formData.phone,
            country_code: formData.countryCode,
            password_hash: btoa(formData.password), // Store for reference
            email: email,
            subscription_plan: 'FREE',
            role: 'user'
          });

        if (profileError) {
          toast({
            title: "Error",
            description: profileError.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Registration successful! Please choose your role."
        });
        navigate('/role-selection');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container flex min-h-screen items-center justify-center">
        <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to HealthMate
            </h1>
            <p className="text-sm text-muted-foreground">
              Save your information to get started
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Register Your Information</CardTitle>
              <CardDescription>
                Enter your details to save them securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <CountrySelector
                    selectedCountry={countries.find(c => c.dialCode === formData.countryCode) || countries[0]}
                    onSelectCountry={(country) => setFormData(prev => ({ ...prev, countryCode: country.dialCode }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Information"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;