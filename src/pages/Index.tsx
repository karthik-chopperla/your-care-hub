import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
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

  // No automatic redirects - homepage is always shown first
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
    { number: "24/7", label: "Emergency Support" }
  ];

  return (
    <MobileLayout showNavigation={false} className="overflow-x-hidden">
      <MobileHeader showLogo={true} showNotifications={false} showBack={false} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="relative space-y-6">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              Bringing 
              <span className="bg-gradient-hero bg-clip-text text-transparent"> Healthcare</span>
              <br />
              Closer to You
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed px-2">
              Experience comprehensive healthcare management with AI-powered symptom checking, 
              easy appointment booking, and 24/7 emergency support.
            </p>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-strong">
            <img 
              src={heroImage} 
              alt="Healthcare professionals and technology" 
              className="w-full h-48 object-cover"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Button variant="hero" size="lg" asChild className="w-full">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
              <Shield className="h-4 w-4" />
              <span className="text-center">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
              <Clock className="h-4 w-4" />
              <span className="text-center">24/7</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
              <Smartphone className="h-4 w-4" />
              <span className="text-center">Mobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 px-4 bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl bg-card shadow-soft">
              <div className="text-2xl font-bold text-primary mb-1">
                {stat.number}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Everything for
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Better Health</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Healthcare solutions that fit your lifestyle
          </p>
        </div>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="mobile-card p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 px-4 bg-gradient-hero text-white mx-4 rounded-2xl mb-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-sm text-white/90">
            Join thousands who trust Health Mate for their healthcare needs.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="secondary" size="lg" asChild className="w-full">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 bg-muted/20">
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-hero">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Health Mate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Bringing healthcare closer to you
            </p>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>&copy; 2024 Health Mate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </MobileLayout>
  );
};

export default Index;