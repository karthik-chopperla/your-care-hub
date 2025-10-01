import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Home as HomeIcon, User, Clock, Calendar, MapPin, Star,
  Phone, Heart, Syringe, Stethoscope, Pill, Activity,
  BedDouble, AlertCircle, Plus, CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HomeNursingPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [nursingPartners, setNursingPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const serviceTypes = [
    { id: 'wound_care', name: 'Wound Care', icon: <Syringe className="h-5 w-5" />, description: 'Professional wound dressing and care' },
    { id: 'injections', name: 'Injections & IV', icon: <Pill className="h-5 w-5" />, description: 'Medication administration' },
    { id: 'elder_care', name: 'Elder Care', icon: <User className="h-5 w-5" />, description: '24/7 elderly patient care' },
    { id: 'post_surgery', name: 'Post-Surgery Care', icon: <Stethoscope className="h-5 w-5" />, description: 'Recovery assistance' },
    { id: 'physiotherapy', name: 'Physiotherapy', icon: <Activity className="h-5 w-5" />, description: 'Physical rehabilitation' },
    { id: 'bed_ridden_care', name: 'Bed-Ridden Care', icon: <BedDouble className="h-5 w-5" />, description: 'Complete bedridden patient care' },
    { id: 'vital_monitoring', name: 'Vital Monitoring', icon: <Heart className="h-5 w-5" />, description: 'Regular health monitoring' },
    { id: 'medication_mgmt', name: 'Medication Management', icon: <Pill className="h-5 w-5" />, description: 'Medicine scheduling and administration' }
  ];

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    setUserInfo(user);
    loadData(user.id);

    // Real-time subscriptions
    const nursingChannel = supabase
      .channel('home-nursing-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_nursing_partners' }, () => {
        loadNursingPartners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(nursingChannel);
    };
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    await Promise.all([
      loadNursingPartners(),
      loadBookings(userId)
    ]);
    setLoading(false);
  };

  const loadNursingPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('home_nursing_partners')
        .select('*')
        .eq('is_available', true)
        .order('ratings', { ascending: false });

      if (error) throw error;
      setNursingPartners(data || []);
    } catch (error) {
      console.error('Error loading nursing partners:', error);
    }
  };

  const loadBookings = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('partner_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_type', 'home_nursing')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const bookNurse = async (partnerId, bookingType) => {
    try {
      const partner = nursingPartners.find(p => p.id === partnerId);
      
      const { error } = await supabase
        .from('partner_bookings')
        .insert({
          user_id: userInfo.id,
          partner_id: partnerId,
          partner_type: 'home_nursing',
          booking_type: bookingType,
          status: 'pending',
          scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          details: {
            agency_name: partner.agency_name,
            services: selectedServices,
            booking_type: bookingType
          }
        });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: `${bookingType === 'on_demand' ? 'Nurse will arrive shortly' : 'Visit scheduled successfully'}`
      });

      setSelectedServices([]);
      loadBookings(userInfo.id);
    } catch (error) {
      console.error('Error booking nurse:', error);
      toast({
        title: "Error",
        description: "Failed to book nursing service",
        variant: "destructive"
      });
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const filteredPartners = nursingPartners.filter(partner => 
    partner.agency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.city?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="p-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Home Nursing</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">
              <Stethoscope className="mr-2 h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="nurses">
              <User className="mr-2 h-4 w-4" />
              Agencies
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </TabsTrigger>
          </TabsList>

          {/* Services Selection */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Required Services</CardTitle>
                <CardDescription>
                  Choose the nursing services you need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceTypes.map((service) => (
                    <Card 
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        selectedServices.includes(service.id) 
                          ? 'border-teal-500 bg-teal-500/5' 
                          : 'hover:border-teal-300'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedServices.includes(service.id)
                              ? 'bg-teal-500 text-white'
                              : 'bg-teal-500/10 text-teal-600'
                          }`}>
                            {service.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                          {selectedServices.includes(service.id) && (
                            <CheckCircle className="h-5 w-5 text-teal-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="mt-6 p-4 bg-teal-500/10 rounded-lg">
                    <h4 className="font-semibold mb-2">Selected Services ({selectedServices.length})</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedServices.map(id => {
                        const service = serviceTypes.find(s => s.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {service?.name}
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Proceed to select a nursing agency to book these services
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nursing Agencies */}
          <TabsContent value="nurses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Nursing Agencies</CardTitle>
                <CardDescription>
                  Professional home nursing services near you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <Input
                  placeholder="Search agencies or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredPartners.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPartners.map((partner) => (
                      <Card key={partner.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{partner.agency_name}</h3>
                              
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{partner.city}, {partner.state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">{partner.ratings || 0}</span>
                                </div>
                                <Badge variant={partner.is_available ? "default" : "secondary"}>
                                  {partner.is_available ? "Available" : "Busy"}
                                </Badge>
                              </div>

                              <div className="space-y-2 text-sm mb-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{partner.available_nurses || 0} nurses available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>Service radius: {partner.service_radius}km</span>
                                </div>
                              </div>

                              {partner.services_offered && partner.services_offered.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {partner.services_offered.slice(0, 5).map((service, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {partner.pricing && (
                                <p className="text-sm text-muted-foreground">
                                  Starting from ₹{partner.pricing.hourly_rate || '500'}/hour
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button 
                                onClick={() => bookNurse(partner.id, 'on_demand')}
                                disabled={!partner.is_available || selectedServices.length === 0}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Book Now
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => bookNurse(partner.id, 'scheduled')}
                                disabled={!partner.is_available || selectedServices.length === 0}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Visit
                              </Button>
                              {partner.phone_number && (
                                <Button variant="ghost" size="sm">
                                  <Phone className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No nursing agencies found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bookings */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Nursing Bookings</CardTitle>
                <CardDescription>Track assigned nurses and scheduled visits</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold mb-2">
                                {booking.details?.agency_name || 'Nursing Service'}
                              </h4>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {booking.booking_type === 'on_demand' ? 'On Demand' : 'Scheduled'} Service
                                </p>
                                {booking.scheduled_at && (
                                  <p className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(booking.scheduled_at).toLocaleString()}
                                  </p>
                                )}
                                {booking.details?.services && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {booking.details.services.map((serviceId, idx) => {
                                      const service = serviceTypes.find(s => s.id === serviceId);
                                      return (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {service?.name || serviceId}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'completed' ? 'secondary' :
                              'outline'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No bookings yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => {
                        const tab = document.querySelector('[value="services"]') as HTMLElement;
                        tab?.click();
                      }}
                    >
                      Book a Nurse
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HomeNursingPage;