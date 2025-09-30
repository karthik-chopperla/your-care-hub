import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Phone, Shield, Stethoscope, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CountrySelector } from "@/components/CountrySelector";
import { countries } from "@/data/countries";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has a role, if not redirect to role selection
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (profile?.role) {
          if (profile.role === 'user') {
            navigate('/user-dashboard');
          } else if (profile.role === 'partner') {
            navigate('/partner-dashboard');
          }
        } else {
          navigate('/role-selection');
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Check role and redirect accordingly
          setTimeout(() => {
            checkUser();
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (
    authData: {
      email?: string;
      phone?: string;
      countryCode?: string;
      password: string;
      fullName?: string;
      avatarUrl?: string;
    },
    isSignUp: boolean,
    authType: 'email' | 'phone'
  ) => {
    setIsLoading(true);
    try {
      let result;
      
      if (authType === 'email') {
        const authOptions = {
          email: authData.email!,
          password: authData.password,
          ...(isSignUp && {
            options: {
              emailRedirectTo: `${window.location.origin}/role-selection`,
              data: {
                full_name: authData.fullName,
                avatar_url: authData.avatarUrl,
              }
            }
          })
        };

        result = isSignUp
          ? await supabase.auth.signUp(authOptions)
          : await supabase.auth.signInWithPassword({
              email: authData.email!,
              password: authData.password
            });
      } else {
        const fullPhone = `${authData.countryCode}${authData.phone}`;
        
        result = isSignUp 
          ? await supabase.auth.signUp({
              phone: fullPhone,
              password: authData.password,
              options: {
                data: {
                  full_name: authData.fullName,
                  avatar_url: authData.avatarUrl,
                }
              }
            })
          : await supabase.auth.signInWithPassword({ 
              phone: fullPhone, 
              password: authData.password 
            });
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Account Created" : "Welcome Back",
          description: isSignUp ? "Your account has been created successfully!" : "Successfully signed in!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center">
          <div className="p-3 rounded-xl bg-gradient-hero shadow-medium">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold text-foreground">Health Mate</span>
        </div>

        <Card className="shadow-strong border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to HealthMate</CardTitle>
            <CardDescription>
              Sign in with your email or phone number - no verification codes needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <AuthForm 
                  onSubmit={handleAuth}
                  isLoading={isLoading}
                  submitText="Sign In"
                  isSignUp={false}
                />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <AuthForm 
                  onSubmit={handleAuth}
                  isLoading={isLoading}
                  submitText="Create Account"
                  isSignUp={true}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-primary/10 mx-auto w-fit">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Secure</p>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-wellness/10 mx-auto w-fit">
              <Mail className="h-6 w-6 text-wellness" />
            </div>
            <p className="text-xs text-muted-foreground">Email & Phone</p>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-urgent/10 mx-auto w-fit">
              <Stethoscope className="h-6 w-6 text-urgent" />
            </div>
            <p className="text-xs text-muted-foreground">HIPAA Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthFormProps {
  onSubmit: (
    authData: {
      email?: string;
      phone?: string;
      countryCode?: string;
      password: string;
      fullName?: string;
      avatarUrl?: string;
    },
    isSignUp: boolean,
    authType: 'email' | 'phone'
  ) => void;
  isLoading: boolean;
  submitText: string;
  isSignUp: boolean;
}

function AuthForm({ onSubmit, isLoading, submitText, isSignUp }: AuthFormProps) {
  const [authType, setAuthType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to US
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      return; // Error handling for password mismatch
    }

    const authData = {
      email: authType === 'email' ? email : undefined,
      phone: authType === 'phone' ? phone : undefined,
      countryCode: authType === 'phone' ? selectedCountry.dialCode : undefined,
      password,
      fullName: isSignUp ? fullName : undefined,
      avatarUrl: isSignUp ? avatarUrl : undefined,
    };

    onSubmit(authData, isSignUp, authType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Auth Type Toggle */}
      <div className="space-y-2">
        <Label>Authentication Method</Label>
        <Tabs value={authType} onValueChange={(value) => setAuthType(value as 'email' | 'phone')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      )}

      {/* Email Auth Fields */}
      {authType === 'email' && (
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      )}

      {/* Phone Auth Fields */}
      {authType === 'phone' && (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="space-y-2">
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="123-456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your phone number without country code
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {isSignUp && (
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters
          </p>
        )}
      </div>

      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          {password !== confirmPassword && confirmPassword.length > 0 && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      )}

      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
          <Input
            id="avatarUrl"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || (isSignUp && password !== confirmPassword)} 
        variant="hero"
      >
        {isLoading ? "Please wait..." : submitText}
      </Button>
      
      {isSignUp && (
        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our terms of service and privacy policy.
          No email or SMS verification required.
        </p>
      )}
    </form>
  );
}