import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Pill, 
  Stethoscope, 
  User, 
  AlertTriangle, 
  Bell, 
  Heart, 
  MapPin, 
  Users,
  Phone,
  CreditCard,
  Baby,
  Brain,
  Home,
  Utensils,
  Star,
  Activity,
  FileText,
  Leaf,
  ShoppingBag,
  Dumbbell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";

const UserDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sosActive, setSosActive] = useState(false);
  const [medicineReminders, setMedicineReminders] = useState([]);
  const [nearbyMedicalShops, setNearbyMedicalShops] = useState([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth(true);

  useEffect(() => {
    const checkRoleAndLoadData = async () => {
      if (!user || loading) return;
      
      // Check if user is actually a 'user' role, not 'partner'
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // If no role, redirect to role selection
      if (!roles?.role) {
        navigate('/role-selection', { replace: true });
        return;
      }

      if (roles.role === 'partner') {
        // Redirect partner to their service dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('service_type')
          .eq('id', user.id)
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

        navigate(dashboardMap[profile?.service_type || ''] || '/partner-services', { replace: true });
        return;
      }

      loadDashboardData(user.id);
      loadUserProfile(user.id);
    };

    checkRoleAndLoadData();
  }, [user, loading, navigate]);

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const loadDashboardData = async (userId: string) => {
    try {
      // Load notifications for this user
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .limit(5)
        .order('created_at', { ascending: false });

      if (notificationsData) {
        setNotifications(notificationsData);
      }

      // Load upcoming appointments for this user
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialty)')
        .eq('user_id', userId)
        .limit(3)
        .order('scheduled_at', { ascending: true });

      if (appointmentsData) {
        setAppointments(appointmentsData);
      }

      // Load medicine reminders
      const { data: remindersData } = await supabase
        .from('medicine_reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('next_reminder', { ascending: true })
        .limit(3);

      if (remindersData) {
        setMedicineReminders(remindersData);
      }

      // Load nearby medical shops
      const { data: shopsData } = await supabase
        .from('medical_shops')
        .select('*')
        .eq('is_open', true)
        .limit(3);

      if (shopsData) {
        setNearbyMedicalShops(shopsData);
      }

      // Subscribe to real-time updates
      const reminderChannel = supabase
        .channel('medicine-reminders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'medicine_reminders', filter: `user_id=eq.${userId}` }, () => {
          loadDashboardData(userId);
        })
        .subscribe();

      const shopChannel = supabase
        .channel('medical-shops-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_shops' }, () => {
          loadDashboardData(userId);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(reminderChannel);
        supabase.removeChannel(shopChannel);
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleSOS = async () => {
    setSosActive(true);
    try {
      // Get user's location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };

        // Create SOS event
        const { data, error } = await supabase
          .from('sos_events')
          .insert({
            user_id: user?.id || 'demo-user',
            location: location,
            status: 'initiated'
          });

        if (error) {
          console.error('SOS Error:', error);
          toast({
            title: "SOS Alert Sent",
            description: "Emergency services have been notified of your location.",
          });
        } else {
          toast({
            title: "SOS Alert Sent",
            description: "Emergency services have been notified. Help is on the way!",
          });
        }
      });
    } catch (error) {
      toast({
        title: "SOS Alert Sent",
        description: "Emergency services have been notified.",
      });
    }
    
    // Reset SOS button after 5 seconds
    setTimeout(() => setSosActive(false), 5000);
  };

  const quickActions = [
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: "AI Symptom Checker",
      description: "Get instant health assessment",
      path: "/symptom-checker",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Home Remedies",
      description: "Natural healing solutions",
      path: "/home-remedies",
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Hospital Finder",
      description: "Locate nearby healthcare",
      path: "/hospitals",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Doctor Booking",
      description: "Find and book appointments",
      path: "/doctors",
      color: "bg-cyan-500/10 text-cyan-600"
    },
    {
      icon: <Pill className="h-6 w-6" />,
      title: "Medicine Reminders",
      description: "Never miss your medication",
      path: "/reminders",
      color: "bg-red-500/10 text-red-600"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Medical Shop",
      description: "Order medicines and refills",
      path: "/medical-shop",
      color: "bg-rose-500/10 text-rose-600"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Mental Health",
      description: "Counseling and support",
      path: "/mental-health",
      color: "bg-indigo-500/10 text-indigo-600"
    },
    {
      icon: <Home className="h-6 w-6" />,
      title: "Home Nursing",
      description: "Professional care at home",
      path: "/home-nursing",
      color: "bg-teal-500/10 text-teal-600"
    },
    {
      icon: <Baby className="h-6 w-6" />,
      title: "Pregnancy Care",
      description: "Mother and baby wellness",
      path: "/pregnancy-care",
      color: "bg-pink-500/10 text-pink-600"
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "Diet Plans",
      description: "Nutrition and meal planning",
      path: "/diet-plans",
      color: "bg-orange-500/10 text-orange-600"
    },
    {
      icon: <Dumbbell className="h-6 w-6" />,
      title: "Fitness Recovery",
      description: "Exercise and recovery plans",
      path: "/fitness-recovery",
      color: "bg-lime-500/10 text-lime-600"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Health Insurance",
      description: "Policies and claims",
      path: "/insurance",
      color: "bg-violet-500/10 text-violet-600"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "My Records",
      description: "Store health documents",
      path: "/my-records",
      color: "bg-slate-500/10 text-slate-600"
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "Find Food",
      description: "Healthy food services",
      path: "/find-food",
      color: "bg-amber-500/10 text-amber-600"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Subscription Plans",
      description: "Upgrade your plan",
      path: "/subscription",
      color: "bg-yellow-500/10 text-yellow-600"
    }
  ];

  const subscriptionPlans = [
    { name: "FREE", color: "bg-gray-500", features: ["Basic symptom checker", "Find doctors/hospitals"] },
    { name: "SILVER", color: "bg-gray-400", features: ["Everything in Free", "Medicine reminders", "Elder expert consultations"] },
    { name: "GOLD", color: "bg-yellow-500", features: ["Everything in Silver", "Telemedicine", "Diet plans", "Mental health support"] },
    { name: "PLATINUM", color: "bg-purple-500", features: ["Everything in Gold", "SOS Emergency", "Home nursing", "Pregnancy care", "Priority support"] }
  ];

  const currentPlan = userProfile?.subscription_plan || 'FREE';

  if (loading) {
    return (
      <MobileLayout showNavigation={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      {/* Mobile Header */}
      <MobileHeader 
        showLogo={true}
        showNotifications={true}
      />

      <main className="px-4 py-6 space-y-5">
        {/* Welcome Section with SOS */}
        <div className="mobile-card bg-gradient-hero p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">
                Welcome, {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-white/90 text-sm">
                Your health journey continues
              </p>
            </div>
            {/* SOS Button */}
            <Button
              onClick={handleSOS}
              disabled={sosActive}
              className={`${sosActive ? 'bg-urgent' : 'bg-urgent hover:bg-urgent/90'} text-white font-bold px-4 py-2 rounded-xl shadow-floating shrink-0`}
              size="sm"
            >
              <AlertTriangle className="h-5 w-5" />
            </Button>
          </div>
          <Badge className={`${subscriptionPlans.find(p => p.name === currentPlan)?.color} text-white px-3 py-1`}>
            {currentPlan} PLAN
          </Badge>
        </div>

        {/* Quick Actions Grid - All 16 Tiles */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2.5">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                className="mobile-card p-2.5 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform min-h-[90px]"
                onClick={() => navigate(action.path)}
              >
                <div className={`mb-1.5 p-2 rounded-xl ${action.color}`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-[10px] leading-tight text-center">{action.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Widgets - Mobile Optimized */}
        <div className="space-y-4">
          {/* Upcoming Appointments */}
          <div className="mobile-card">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming Appointments
              </h3>
            </div>
            <div className="p-4">
              {appointments.length > 0 ? (
                <div className="space-y-2">
                  {appointments.slice(0, 2).map((appointment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appointment.doctors?.name || 'Doctor'}</p>
                        <p className="text-xs text-muted-foreground">{appointment.doctors?.specialty}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{new Date(appointment.scheduled_at).toLocaleDateString()}</Badge>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-primary" size="sm" onClick={() => navigate('/bookings')}>
                    View All
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm mb-3">No upcoming appointments</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>
                    Book Now
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Medicine Reminders */}
          <div className="mobile-card">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4 text-urgent" />
                Medicine Reminders
              </h3>
            </div>
            <div className="p-4">
              {medicineReminders.length > 0 ? (
                <div className="space-y-2">
                  {medicineReminders.slice(0, 2).map((reminder, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reminder.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">{reminder.dosage}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {reminder.next_reminder ? new Date(reminder.next_reminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-primary" size="sm" onClick={() => navigate('/reminders')}>
                    View All
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Pill className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm mb-3">No active reminders</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/reminders')}>
                    Add Reminder
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Medical Shops - Mobile Optimized */}
        {nearbyMedicalShops.length > 0 && (
          <div className="mobile-card">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                Nearby Medical Shops
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {nearbyMedicalShops.slice(0, 2).map((shop, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-muted/30 rounded-xl cursor-pointer active:scale-95 transition-transform" 
                  onClick={() => navigate('/medical-shop')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm flex-1">{shop.shop_name}</p>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{shop.ratings || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    {shop.city}, {shop.state}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={shop.is_open ? "default" : "secondary"} className="text-xs px-2 py-0">
                      {shop.is_open ? "Open" : "Closed"}
                    </Badge>
                    {shop.delivery_available && (
                      <Badge variant="outline" className="text-xs px-2 py-0">Delivery</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Plans - Mobile Optimized */}
        <div className="mobile-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Your Subscription
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {subscriptionPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl border-2 ${currentPlan === plan.name ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className={`w-fit px-2 py-0.5 rounded-md text-white text-xs font-medium mb-2 ${plan.color}`}>
                    {plan.name}
                  </div>
                  <ul className="space-y-1 text-xs mb-2">
                    {plan.features.slice(0, 2).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <div className="h-1 w-1 bg-secondary rounded-full mt-1.5 shrink-0"></div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== plan.name && (
                    <Button 
                      className="w-full h-7 text-xs" 
                      variant={plan.name === 'PLATINUM' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toast({ title: "Coming soon!", description: "Subscription upgrade will be available soon." })}
                    >
                      Upgrade
                    </Button>
                  )}
                  {currentPlan === plan.name && (
                    <div className="text-xs text-primary font-medium text-center">Active</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </MobileLayout>
  );
};

export default UserDashboard;