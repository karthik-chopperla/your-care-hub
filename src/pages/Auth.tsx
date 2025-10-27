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

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roles?.role) {
          if (roles.role === 'user') {
            navigate('/user-dashboard', { replace: true });
          } else if (roles.role === 'partner') {
            navigate('/partner-dashboard', { replace: true });
          }
        }
      }
    };
    checkUser();
  }, [navigate]);

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'partner'
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

        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: signupData.role
          });

        if (roleError) console.error('Role assignment error:', roleError);

        toast({
          title: "Success",
          description: "Account created successfully!"
        });

        // Navigate based on role
        if (signupData.role === 'user') {
          navigate('/user-dashboard');
        } else {
          navigate('/partner-dashboard');
        }
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

      // If login method is phone, lookup email from profiles
      if (loginMethod === 'phone') {
        if (!validatePhone(loginData.identifier)) {
          throw new Error("Phone number must be 8-15 digits");
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, id')
          .eq('phone_number', loginData.identifier)
          .single();

        if (profileError || !profile) {
          throw new Error("No account found with this phone number");
        }

        // Get the auth user's email
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
        if (authUser?.user?.email) {
          email = authUser.user.email;
        } else {
          email = `${loginData.identifier}@phone.healthmate.app`;
        }
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

        if (roles?.role === 'user') {
          navigate('/user-dashboard');
        } else if (roles?.role === 'partner') {
          navigate('/partner-dashboard');
        } else {
          navigate('/user-dashboard');
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container flex min-h-screen items-center justify-center py-8">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container flex min-h-screen items-center justify-center py-8">
        <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome to HealthMate
            </h1>
            <p className="text-sm text-muted-foreground">
              Your complete healthcare companion
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Access your account securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Login Method</Label>
                      <RadioGroup value={loginMethod} onValueChange={(value: 'email' | 'phone') => setLoginMethod(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="login-email" />
                          <Label htmlFor="login-email" className="font-normal cursor-pointer">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="login-phone" />
                          <Label htmlFor="login-phone" className="font-normal cursor-pointer">Phone Number</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginIdentifier">
                        {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                      </Label>
                      <Input
                        id="loginIdentifier"
                        type={loginMethod === 'email' ? 'email' : 'tel'}
                        placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                        value={loginData.identifier}
                        onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Password</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>

                    <div className="flex flex-col space-y-2 text-center text-sm">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join our healthcare network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Login Method</Label>
                      <RadioGroup value={signupMethod} onValueChange={(value: 'email' | 'phone') => setSignupMethod(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="signup-email" />
                          <Label htmlFor="signup-email" className="font-normal cursor-pointer">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="signup-phone" />
                          <Label htmlFor="signup-phone" className="font-normal cursor-pointer">Phone Number</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {signupMethod === 'email' ? (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupData.email}
                          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <CountrySelector
                            selectedCountry={countries.find(c => c.dialCode === signupData.countryCode) || countries[0]}
                            onSelectCountry={(country) => setSignupData(prev => ({ ...prev, countryCode: country.dialCode }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={signupData.phone}
                            onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Must contain uppercase, lowercase, and digit
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={signupData.role} onValueChange={(value: 'user' | 'partner') => setSignupData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="partner">Partner (Doctor/Hospital/Service Provider)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;