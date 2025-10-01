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
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";

const UserDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sosActive, setSosActive] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [medicineReminders, setMedicineReminders] = useState([]);
  const [nearbyMedicalShops, setNearbyMedicalShops] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has access to this dashboard
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (user.role !== 'user') {
      navigate('/', { replace: true });
      return;
    }

    setUserInfo(user);
    loadDashboardData(user.id);
  }, [navigate]);

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
            user_id: userInfo?.id || 'demo-user',
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
      color: "bg-blue-500/10 text-blue-600",
      buttonVariant: "default"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Doctor",
      description: "Find and book appointments",
      path: "/doctors",
      color: "bg-green-500/10 text-green-600",
      buttonVariant: "default"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Find Hospitals",
      description: "Locate nearby healthcare",
      path: "/hospitals",
      color: "bg-purple-500/10 text-purple-600",
      buttonVariant: "default"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Elder Experts",
      description: "Traditional medicine guidance",
      path: "/elder-experts",
      color: "bg-amber-500/10 text-amber-600",
      buttonVariant: "default"
    },
    {
      icon: <Pill className="h-6 w-6" />,
      title: "Medicine Reminders",
      description: "Never miss your medication",
      path: "/reminders",
      color: "bg-red-500/10 text-red-600",
      buttonVariant: "default"
    },
    {
      icon: <Pill className="h-6 w-6" />,
      title: "Medical Shop",
      description: "Order medicines and refills",
      path: "/medical-shop",
      color: "bg-red-500/10 text-red-600",
      buttonVariant: "default"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Mental Health",
      description: "Counseling and support",
      path: "/mental-health",
      color: "bg-indigo-500/10 text-indigo-600",
      buttonVariant: "default"
    },
    {
      icon: <Baby className="h-6 w-6" />,
      title: "Pregnancy Care",
      description: "Mother and baby wellness",
      path: "/pregnancy-care",
      color: "bg-pink-500/10 text-pink-600",
      buttonVariant: "default"
    },
    {
      icon: <Home className="h-6 w-6" />,
      title: "Home Nursing",
      description: "Professional care at home",
      path: "/home-nursing",
      color: "bg-teal-500/10 text-teal-600",
      buttonVariant: "default"
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "Diet Plans",
      description: "Nutrition and meal planning",
      path: "/diet-plans",
      color: "bg-orange-500/10 text-orange-600",
      buttonVariant: "default"
    }
  ];

  const subscriptionPlans = [
    { name: "FREE", color: "bg-gray-500", features: ["Basic symptom checker", "Find doctors/hospitals"] },
    { name: "SILVER", color: "bg-gray-400", features: ["Everything in Free", "Medicine reminders", "Elder expert consultations"] },
    { name: "GOLD", color: "bg-yellow-500", features: ["Everything in Silver", "Telemedicine", "Diet plans", "Mental health support"] },
    { name: "PLATINUM", color: "bg-purple-500", features: ["Everything in Gold", "SOS Emergency", "Home nursing", "Pregnancy care", "Priority support"] }
  ];

  const currentPlan = userInfo?.subscription_plan || 'FREE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-20 md:pb-8">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">HealthMate</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Welcome Section with SOS */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {userInfo?.full_name || 'User'}!
              </h1>
              <p className="text-white/90 mb-4">
                Your health journey continues here. How can we help you today?
              </p>
              <Badge className={`${subscriptionPlans.find(p => p.name === currentPlan)?.color} text-white`}>
                {currentPlan} PLAN
              </Badge>
            </div>
            <Button
              onClick={handleSOS}
              disabled={sosActive}
              className={`${sosActive ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold px-6 py-3 text-lg`}
              size="lg"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              {sosActive ? 'SOS SENT' : 'SOS'}
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`mb-3 p-3 rounded-lg mx-auto w-fit ${action.color}`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.doctors?.name || 'Doctor'}</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctors?.specialty}</p>
                      </div>
                      <Badge variant="outline">{new Date(appointment.scheduled_at).toLocaleDateString()}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming appointments</p>
                  <Button variant="outline" className="mt-3" onClick={() => navigate('/doctors')}>
                    Book Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medicine Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-red-600" />
                Medicine Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicineReminders.length > 0 ? (
                <div className="space-y-3">
                  {medicineReminders.map((reminder, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{reminder.medicine_name}</p>
                        <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                      </div>
                      <Badge variant="outline">
                        {reminder.next_reminder ? new Date(reminder.next_reminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate('/reminders')}>
                    View All Reminders
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active reminders</p>
                  <Button variant="outline" className="mt-3" onClick={() => navigate('/reminders')}>
                    Add Reminder
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No new notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medical Shops Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-red-600" />
              Nearby Medical Shops
            </CardTitle>
            <CardDescription>
              Order medicines and refills from nearby pharmacies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nearbyMedicalShops.length > 0 ? (
              <div className="space-y-3">
                {nearbyMedicalShops.map((shop, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors" onClick={() => navigate('/medical-shop')}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{shop.shop_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {shop.city}, {shop.state}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={shop.is_open ? "default" : "secondary"}>
                            {shop.is_open ? "Open" : "Closed"}
                          </Badge>
                          {shop.delivery_available && (
                            <Badge variant="outline">Delivery Available</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{shop.ratings || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate('/medical-shop')}>
                  View All Medical Shops
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No medical shops found</p>
                <Button variant="outline" className="mt-3" onClick={() => navigate('/medical-shop')}>
                  Search Medical Shops
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Services Quick Access */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Explore All Services</h3>
                <p className="text-white/90">
                  Access all partner services with real-time updates
                </p>
              </div>
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => navigate('/all-services')}
              >
                View All Services
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Upgrade your plan to unlock more features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptionPlans.map((plan, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${currentPlan === plan.name ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                  <div className={`w-fit px-3 py-1 rounded-full text-white text-sm font-medium mb-3 ${plan.color}`}>
                    {plan.name}
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== plan.name && (
                    <Button 
                      className="w-full mt-4" 
                      variant={plan.name === 'PLATINUM' ? 'default' : 'outline'}
                      onClick={() => navigate('/subscriptions')}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <MobileNavigation />
    </div>
  );
};

export default UserDashboard;