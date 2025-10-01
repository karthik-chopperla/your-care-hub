import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, Utensils, Dumbbell, Shield, Users, Pill, 
  Ambulance, Stethoscope, Baby, Brain, Home as HomeIcon,
  Search, MapPin, Star, Heart, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AllServicesPage = () => {
  const [locationFilter, setLocationFilter] = useState<"all" | "nearby">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadServiceCounts();
    
    // Subscribe to real-time updates
    const channels = [
      'hospitals', 'restaurant_partners', 'fitness_partners', 'insurance_partners',
      'elder_experts', 'medical_shops', 'ambulance_partners', 'doctors',
      'gynecologists', 'mental_health_partners', 'home_nursing_partners'
    ].map(table => {
      return supabase
        .channel(`${table}-changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          loadServiceCounts();
        })
        .subscribe();
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const loadServiceCounts = async () => {
    try {
      const counts: any = {};
      
      const tables = [
        { name: 'hospitals', key: 'hospital' },
        { name: 'restaurant_partners', key: 'restaurant' },
        { name: 'fitness_partners', key: 'fitness' },
        { name: 'insurance_partners', key: 'insurance' },
        { name: 'elder_experts', key: 'elder' },
        { name: 'medical_shops', key: 'medicalShop' },
        { name: 'ambulance_partners', key: 'ambulance' },
        { name: 'doctors', key: 'doctor' },
        { name: 'gynecologists', key: 'pregnancy' },
        { name: 'mental_health_partners', key: 'mentalHealth' },
        { name: 'home_nursing_partners', key: 'homeNursing' }
      ];

      for (const table of tables) {
        const { count } = await supabase
          .from(table.name as any)
          .select('*', { count: 'exact', head: true });
        counts[table.key] = count || 0;
      }

      setServiceCounts(counts);
    } catch (error) {
      console.error('Error loading service counts:', error);
    }
  };

  const services = [
    {
      id: "hospital",
      icon: <Building2 className="h-8 w-8" />,
      title: "Hospital Services",
      description: "Book appointments, check bed availability",
      path: "/hospitals",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      count: serviceCounts.hospital || 0
    },
    {
      id: "restaurant",
      icon: <Utensils className="h-8 w-8" />,
      title: "Diet Plans & Food",
      description: "Healthy meal plans and nutrition guidance",
      path: "/diet-plans",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      count: serviceCounts.restaurant || 0
    },
    {
      id: "fitness",
      icon: <Dumbbell className="h-8 w-8" />,
      title: "Gym & Fitness",
      description: "Personal training and fitness classes",
      path: "/fitness",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      count: serviceCounts.fitness || 0
    },
    {
      id: "insurance",
      icon: <Shield className="h-8 w-8" />,
      title: "Insurance Services",
      description: "Health insurance plans and claims",
      path: "/insurance",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      count: serviceCounts.insurance || 0
    },
    {
      id: "elder",
      icon: <Users className="h-8 w-8" />,
      title: "Elder Advice",
      description: "Traditional health wisdom and guidance",
      path: "/elder-experts",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      count: serviceCounts.elder || 0
    },
    {
      id: "medicalShop",
      icon: <Pill className="h-8 w-8" />,
      title: "Medical Shop",
      description: "Medicine refills and orders",
      path: "/medical-shop",
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      count: serviceCounts.medicalShop || 0
    },
    {
      id: "ambulance",
      icon: <Ambulance className="h-8 w-8" />,
      title: "Emergency SOS",
      description: "24/7 ambulance services",
      path: "/sos",
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      count: serviceCounts.ambulance || 0
    },
    {
      id: "doctor",
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Doctor Consultations",
      description: "Online and offline appointments",
      path: "/doctors",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      count: serviceCounts.doctor || 0
    },
    {
      id: "pregnancy",
      icon: <Baby className="h-8 w-8" />,
      title: "Pregnancy Care",
      description: "Maternity and prenatal services",
      path: "/pregnancy-care",
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
      count: serviceCounts.pregnancy || 0
    },
    {
      id: "mentalHealth",
      icon: <Brain className="h-8 w-8" />,
      title: "Mental Health",
      description: "Therapy and counseling services",
      path: "/mental-health",
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      count: serviceCounts.mentalHealth || 0
    },
    {
      id: "homeNursing",
      icon: <HomeIcon className="h-8 w-8" />,
      title: "Home Nursing",
      description: "Professional care at home",
      path: "/home-nursing",
      color: "text-teal-600",
      bgColor: "bg-teal-500/10",
      count: serviceCounts.homeNursing || 0
    }
  ];

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/user-dashboard')}>
              ← Back
            </Button>
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">All Services</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Find Healthcare Services</CardTitle>
            <CardDescription>
              All updates from partners appear in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Location Filter */}
            <div className="flex gap-2">
              <Button 
                variant={locationFilter === "all" ? "default" : "outline"}
                onClick={() => setLocationFilter("all")}
              >
                All Locations
              </Button>
              <Button 
                variant={locationFilter === "nearby" ? "default" : "outline"}
                onClick={() => setLocationFilter("nearby")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Show Services in My Area
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map((service) => (
            <Card 
              key={service.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate(service.path)}
            >
              <CardContent className="p-6">
                <div className={`mb-4 p-4 rounded-lg w-fit ${service.bgColor}`}>
                  <div className={service.color}>{service.icon}</div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {service.count} {service.count === 1 ? 'Provider' : 'Providers'}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No services found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllServicesPage;
