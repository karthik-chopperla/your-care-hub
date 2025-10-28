import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { 
  Building2, 
  Baby, 
  Brain, 
  HeartPulse, 
  Ambulance, 
  Pill, 
  UtensilsCrossed, 
  Dumbbell, 
  Shield, 
  Users 
} from "lucide-react";

const partnerServices = [
  {
    id: "hospital",
    title: "Hospital Partner",
    description: "Manage appointments, beds, facilities, and medical services",
    icon: Building2,
    path: "/partner/hospital-dashboard",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "gynecologist",
    title: "Gynecologist Partner",
    description: "Manage maternity care, consultations, and pregnancy appointments",
    icon: Baby,
    path: "/partner/gynecologist-dashboard",
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  {
    id: "mental_health",
    title: "Mental Health Partner",
    description: "Provide counseling, therapy sessions, and mental wellness support",
    icon: Brain,
    path: "/partner/mental-health-dashboard",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    id: "home_nursing",
    title: "Home Nursing Partner",
    description: "Offer home nursing services, wound care, and elder care",
    icon: HeartPulse,
    path: "/partner/home-nursing-dashboard",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: "ambulance",
    title: "Emergency SOS Partner",
    description: "Respond to SOS alerts and provide emergency ambulance services",
    icon: Ambulance,
    path: "/partner/ambulance-dashboard",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    id: "medical_shop",
    title: "Medical Shop Partner",
    description: "Manage medicine inventory, orders, and prescription fulfillment",
    icon: Pill,
    path: "/partner/medical-shop-dashboard",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    id: "restaurant",
    title: "Restaurant / Food Provider",
    description: "Offer diet plans, healthy meals, and nutrition services",
    icon: UtensilsCrossed,
    path: "/partner/restaurant-dashboard",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    id: "fitness",
    title: "Fitness Trainer / Gym",
    description: "Provide workout sessions, fitness training, and wellness programs",
    icon: Dumbbell,
    path: "/partner/fitness-dashboard",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    id: "insurance",
    title: "Insurance Partner",
    description: "Manage health insurance policies, claims, and coverage plans",
    icon: Shield,
    path: "/partner/insurance-dashboard",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50"
  },
  {
    id: "elder_advice",
    title: "Elders' Traditional Advice",
    description: "Share traditional wisdom, health advice, and lifestyle guidance",
    icon: Users,
    path: "/partner/elder-advice-dashboard",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  }
];

export default function PartnerServicesList() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roles?.role !== 'partner') {
        navigate("/user-dashboard");
        return;
      }

      setUser(session.user);
    };
    checkAuth();
  }, [navigate]);

  const handleServiceClick = (service: typeof partnerServices[0]) => {
    navigate(service.path);
  };

  if (!user) return null;

  return (
    <MobileLayout showNavigation={false}>
      <MobileHeader title="Partner Services" showBack={false} showNotifications={false} />
      
      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Partner Services</h1>
          <p className="text-sm text-muted-foreground">
            Choose a service type to manage your business
          </p>
        </div>

        <div className="space-y-4">
          {partnerServices.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.id} className="mobile-card">
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${service.bgColor} shrink-0`}>
                      <Icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleServiceClick(service)}
                    className="w-full"
                    size="lg"
                  >
                    Open Dashboard
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
