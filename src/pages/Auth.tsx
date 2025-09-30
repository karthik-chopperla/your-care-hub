import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Phone, Shield, Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePhoneAuth = async (phone: string, password: string, fullName: string, isSignUp: boolean) => {
    setIsLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      
      const { error } = isSignUp 
        ? await supabase.auth.signUp({
            phone: normalizedPhone,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          })
        : await supabase.auth.signInWithPassword({ 
            phone: normalizedPhone, 
            password 
          });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
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

  const normalizePhoneNumber = (phone: string) => {
    // Remove all formatting and add country code if needed
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+${digits}`;
    }
    return `+${digits}`;
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
            <CardTitle className="text-2xl font-bold">Secure Authentication</CardTitle>
            <CardDescription>
              Sign in with your phone number and password - no verification codes needed
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
                  onSubmit={(phone, password, fullName) => handlePhoneAuth(phone, password, fullName, false)}
                  isLoading={isLoading}
                  submitText="Sign In"
                  isSignUp={false}
                />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <AuthForm 
                  onSubmit={(phone, password, fullName) => handlePhoneAuth(phone, password, fullName, true)}
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
              <Phone className="h-6 w-6 text-wellness" />
            </div>
            <p className="text-xs text-muted-foreground">Phone Auth</p>
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
  onSubmit: (phone: string, password: string, fullName: string) => void;
  isLoading: boolean;
  submitText: string;
  isSignUp: boolean;
}

function AuthForm({ onSubmit, isLoading, submitText, isSignUp }: AuthFormProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (phoneNumber.length >= 10) {
      const areaCode = phoneNumber.slice(0, 3);
      const firstPart = phoneNumber.slice(3, 6);
      const secondPart = phoneNumber.slice(6, 10);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    }
    
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(phone, password, fullName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your US phone number with area code
        </p>
      </div>
      
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
      
      <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
        {isLoading ? "Please wait..." : submitText}
      </Button>
      
      {isSignUp && (
        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our terms of service and privacy policy.
          No SMS verification required.
        </p>
      )}
    </form>
  );
}