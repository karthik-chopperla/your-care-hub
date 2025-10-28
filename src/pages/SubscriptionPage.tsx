import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const plans = [
    {
      name: "FREE",
      price: "₹0",
      period: "forever",
      color: "bg-gray-500",
      features: ["Basic symptom checker", "Find doctors/hospitals", "Medicine reminders", "View health tips"]
    },
    {
      name: "SILVER",
      price: "₹299",
      period: "/month",
      color: "bg-gray-400",
      popular: false,
      features: ["Everything in Free", "Elder expert consultations", "Mental health resources", "Diet plan basics", "Priority booking"]
    },
    {
      name: "GOLD",
      price: "₹599",
      period: "/month",
      color: "bg-yellow-500",
      popular: true,
      features: ["Everything in Silver", "Telemedicine", "Personalized diet plans", "Mental health support", "Home nursing discount", "AI chatbot access"]
    },
    {
      name: "PLATINUM",
      price: "₹999",
      period: "/month",
      color: "bg-purple-500",
      popular: false,
      features: ["Everything in Gold", "24/7 SOS Emergency", "Home nursing", "Pregnancy care", "Fitness recovery", "Insurance support", "Priority support"]
    }
  ];

  const subscribe = (planName: string) => {
    toast({
      title: "Coming soon!",
      description: `${planName} subscription will be available soon.`,
      duration: 2000
    });
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="Subscription Plans"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        <Card className="mobile-card bg-gradient-hero text-white">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2" />
            <h2 className="text-lg font-bold">Upgrade Your Health Journey</h2>
            <p className="text-sm text-white/90 mt-1">Choose a plan that fits your needs</p>
          </CardContent>
        </Card>

        {plans.map((plan) => (
          <Card key={plan.name} className={`mobile-card ${plan.popular ? 'border-2 border-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`${plan.color} text-white px-3 py-1 rounded-md text-sm font-bold`}>
                  {plan.name}
                </div>
                {plan.popular && (
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                )}
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => subscribe(plan.name)}
              >
                {plan.name === "FREE" ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </MobileLayout>
  );
};

export default SubscriptionPage;
