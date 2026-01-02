import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  Stethoscope, 
  MapPin, 
  Pill,
  User,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sosLoading, setSosLoading] = useState(false);

  const handleQuickSOS = async () => {
    setSosLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };

        try {
          const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
          
          if (!userInfo.id) {
            toast({
              title: "Please login first",
              description: "You need to be logged in to send SOS alerts",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }
          
          // Create SOS event
          const { data: sosData, error: sosError } = await supabase
            .from('sos_events')
            .insert({
              user_id: userInfo.id,
              location: locationData,
              status: 'initiated',
              notes: 'Emergency assistance requested via quick SOS'
            })
            .select()
            .single();

          if (sosError) throw sosError;

          // Create notification for the user
          await supabase
            .from('notifications')
            .insert({
              user_id: userInfo.id,
              type: 'sos',
              title: '🚨 EMERGENCY SOS ALERT SENT',
              message: `Your emergency request has been sent. Location: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}. Help is on the way.`,
              action_url: '/sos'
            });

          toast({
            title: "🚨 SOS Alert Sent!",
            description: "Emergency services have been notified. Redirecting to tracking...",
          });

          // Navigate to SOS page to track
          setTimeout(() => navigate('/sos'), 1000);
        } catch (error) {
          console.error('SOS Error:', error);
          toast({
            title: "SOS Alert Failed",
            description: "Please try again or call emergency services directly",
            variant: "destructive"
          });
        } finally {
          setSosLoading(false);
        }
      },
      (error) => {
        console.error('Location Error:', error);
        toast({
          title: "Location Access Required",
          description: "Please enable location services and try again",
          variant: "destructive"
        });
        setSosLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const quickActions = [
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: "Symptom Checker",
      description: "AI-powered health assessment",
      variant: "medical" as const,
      link: "/symptom-checker",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Appointment",
      description: "Find and book with doctors",
      variant: "default" as const,
      link: "/doctors",
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "SOS Emergency",
      description: "Emergency assistance",
      variant: "urgent" as const,
      link: "/sos",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Find Hospitals",
      description: "Nearby healthcare facilities",
      variant: "wellness" as const,
      link: "/hospitals",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-hero">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Health Mate</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/reminders">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-xl p-6 text-white shadow-medium">
          <h1 className="text-2xl font-bold mb-2">
            Welcome to HealthMate!
          </h1>
          <p className="text-white/90">
            Your health journey starts here. How can we help you today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-medium transition-all duration-normal hover:-translate-y-1 border-border/50"
              onClick={() => navigate(action.link)}
            >
              <CardContent className="p-6">
                <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/doctors">Book Appointment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medicine Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No medicine reminders set</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/reminders">Add Reminder</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center shadow-soft border-border/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <p className="text-sm text-muted-foreground">Consultations This Month</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-border/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-2">0</div>
              <p className="text-sm text-muted-foreground">Health Reports</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-border/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-urgent mb-2">0</div>
              <p className="text-sm text-muted-foreground">Emergency Contacts</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating SOS Button - More Prominent */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        <span className="bg-destructive text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce">
          🚨 SOS
        </span>
        <Button
          onClick={handleQuickSOS}
          disabled={sosLoading}
          size="lg"
          className="h-20 w-20 rounded-full bg-destructive hover:bg-destructive/90 shadow-2xl border-4 border-white"
          style={{
            animation: sosLoading ? 'none' : 'pulse 2s infinite',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.5), 0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          {sosLoading ? (
            <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-white" />
          )}
        </Button>
      </div>

      {/* Emergency call option */}
      <div className="fixed bottom-6 left-6 z-50">
        <a href="tel:108">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-4 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-white shadow-lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call 108
          </Button>
        </a>
      </div>
    </div>
  );
}