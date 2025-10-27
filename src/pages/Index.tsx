import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  MapPin, 
  Phone, 
  Shield,
  Clock,
  Users,
  Smartphone
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-healthcare.jpg";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check user's role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roles?.role === 'user') {
          navigate('/user-dashboard', { replace: true });
        } else if (roles?.role === 'partner') {
          // Check if partner has selected service type
          const { data: profile } = await supabase
            .from('profiles')
            .select('service_type')
            .eq('id', session.user.id)
            .single();

          if (profile?.service_type) {
            navigate('/partner-dashboard', { replace: true });
          } else {
            navigate('/role-selection', { replace: true });
          }
        }
      }
    };

    checkUserStatus();
  }, [navigate]);
  const features = [
    {
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
      title: "AI Symptom Checker",
      description: "Get instant health assessments with our advanced AI that analyzes symptoms and provides personalized recommendations."
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: "Book Appointments",
      description: "Find and book appointments with qualified doctors and specialists near you with real-time availability."
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Telemedicine",
      description: "Connect with healthcare professionals through video consultations from the comfort of your home."
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Find Healthcare",
      description: "Locate nearby hospitals, clinics, and pharmacies with detailed information and reviews."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Emergency SOS",
      description: "Quick access to emergency services and contacts when you need immediate medical assistance."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Family Care",
      description: "Manage health records and appointments for your entire family in one secure platform."
    }
  ];

  const stats = [
    { number: "50K+", label: "Registered Users" },
    { number: "1000+", label: "Verified Doctors" },
    { number: "500+", label: "Partner Hospitals" },
    { number: "24/7", label: "Emergency Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Bringing 
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Healthcare</span>
                  <br />
                  Closer to You
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Experience comprehensive healthcare management with AI-powered symptom checking, 
                  easy appointment booking, and 24/7 emergency support. Your health, simplified.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile Ready</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl blur-2xl" />
              <img 
                src={heroImage} 
                alt="Healthcare professionals and technology" 
                className="relative rounded-2xl shadow-strong w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need for
              <span className="bg-gradient-hero bg-clip-text text-transparent"> Better Health</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with personalized care 
              to deliver healthcare solutions that fit your lifestyle.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-lg lg:text-xl text-white/90">
              Join thousands of users who trust Health Mate for their healthcare needs. 
              Start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="xl" asChild>
                <Link to="/auth">Start Free Trial</Link>
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="border-white/20 text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-hero">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Health Mate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bringing healthcare closer to you with innovative technology and compassionate care.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/doctors" className="hover:text-foreground transition-colors">Find Doctors</Link></li>
                <li><Link to="/hospitals" className="hover:text-foreground transition-colors">Hospitals</Link></li>
                <li><Link to="/emergency" className="hover:text-foreground transition-colors">Emergency</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@healthmate.com</li>
                <li>1-800-HEALTH-1</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Health Mate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;