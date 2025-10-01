import React from "react";
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
  User
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

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
    </div>
  );
}