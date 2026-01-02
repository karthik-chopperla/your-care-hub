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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { Heart } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in but don't auto-redirect
  // Users can manually go to homepage if they want
  useEffect(() => {
    // Optional: You can show a message if user is already logged in
    // but don't force redirect - let them use the auth page if they want
  }, [navigate]);

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    confirmPassword: ''
  });

  const [loginData, setLoginData] = useState({
    identifier: '', // email or phone
    password: ''
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one digit";
    return null;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^\d{8,15}$/.test(phone);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (signupMethod === 'email' && !validateEmail(signupData.email)) {
        throw new Error("Please enter a valid email address");
      }
      
      if (signupMethod === 'phone' && !validatePhone(signupData.phone)) {
        throw new Error("Phone number must be 8-15 digits");
      }

      const passwordError = validatePassword(signupData.password);
      if (passwordError) throw new Error(passwordError);

      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // For phone signup, create a temporary email
      const email = signupMethod === 'email' 
        ? signupData.email 
        : `${signupData.countryCode}${signupData.phone}@phone.healthmate.app`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupData.fullName,
            phone_number: signupData.phone,
            country_code: signupData.countryCode
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: signupData.fullName,
            phone_number: signupMethod === 'phone' ? signupData.phone : null,
            country_code: signupData.countryCode,
            email: signupMethod === 'email' ? signupData.email : null
          })
          .eq('id', data.user.id);

        if (profileError) console.error('Profile update error:', profileError);

        toast({
          title: "Success",
          description: "Account created successfully!"
        });

        // Always redirect to role selection after signup
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let email = loginData.identifier;

      // If login method is phone, construct the email format used during signup
      if (loginMethod === 'phone') {
        if (!validatePhone(loginData.identifier)) {
          throw new Error("Phone number must be 8-15 digits");
        }

        // First check if we can find the country code from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('country_code')
          .eq('phone_number', loginData.identifier)
          .single();

        // Use the stored country code or default to +91 (most common for this app)
        const countryCode = profile?.country_code || '+91';
        email = `${countryCode}${loginData.identifier}@phone.healthmate.app`;
      } else {
        if (!validateEmail(loginData.identifier)) {
          throw new Error("Please enter a valid email address");
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: loginData.password
      });

      if (error) throw error;

      if (data.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        // If no role assigned, redirect to role selection
        if (!roles?.role) {
          navigate('/role-selection');
          return;
        }

        if (roles.role === 'user') {
          navigate('/user-dashboard');
        } else if (roles.role === 'partner') {
          // Get partner's service type and redirect to specific dashboard
          const { data: profile } = await supabase
            .from('profiles')
            .select('service_type')
            .eq('id', data.user.id)
            .single();

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

          navigate(dashboardMap[profile?.service_type || ''] || '/partner-services');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateEmail(forgotPasswordEmail)) {
        throw new Error("Please enter a valid email address");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent! Check your inbox."
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <MobileLayout showNavigation={false}>
        <MobileHeader title="Forgot Password" showBack={true} showNotifications={false} />
        <div className="px-4 py-6">
          <div className="mobile-card">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNavigation={false} className="overflow-y-auto">
      <div className="px-4 py-6 space-y-6">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="p-3 bg-gradient-hero rounded-2xl">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">
              Welcome to Health Mate
            </h1>
            <p className="text-sm text-muted-foreground">
              Your complete healthcare companion
            </p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <div className="mobile-card">
              <div className="p-6 space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Login</h2>
                  <p className="text-sm text-muted-foreground">
                    Access your account securely
                  </p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Login Method</Label>
                    <RadioGroup value={loginMethod} onValueChange={(value: 'email' | 'phone') => setLoginMethod(value)}>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                        <RadioGroupItem value="email" id="login-email" />
                        <Label htmlFor="login-email" className="font-normal cursor-pointer flex-1">Email</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                        <RadioGroupItem value="phone" id="login-phone" />
                        <Label htmlFor="login-phone" className="font-normal cursor-pointer flex-1">Phone Number</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginIdentifier" className="text-base">
                      {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    </Label>
                    <Input
                      id="loginIdentifier"
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                      value={loginData.identifier}
                      onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-base">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-primary hover:underline text-sm"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <div className="mobile-card">
              <div className="p-6 space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Create Account</h2>
                  <p className="text-sm text-muted-foreground">
                    Join our healthcare network
                  </p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Login Method</Label>
                    <RadioGroup value={signupMethod} onValueChange={(value: 'email' | 'phone') => setSignupMethod(value)}>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                        <RadioGroupItem value="email" id="signup-email" />
                        <Label htmlFor="signup-email" className="font-normal cursor-pointer flex-1">Email</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                        <RadioGroupItem value="phone" id="signup-phone" />
                        <Label htmlFor="signup-phone" className="font-normal cursor-pointer flex-1">Phone Number</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {signupMethod === 'email' ? (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-base">Country</Label>
                        <CountrySelector
                          selectedCountry={countries.find(c => c.dialCode === signupData.countryCode) || countries[0]}
                          onSelectCountry={(country) => setSignupData(prev => ({ ...prev, countryCode: country.dialCode }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={signupData.phone}
                          onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          className="h-12 text-base"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must contain uppercase, lowercase, and digit
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="h-12 text-base"
                    />
                  </div>


                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Auth;