import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, BarChart3, Hospital, Stethoscope, Ambulance, Pill, DollarSign, Utensils, Brain, Baby, Dumbbell, Shield, MessageSquare, PackageCheck, Navigation, ShoppingCart, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serviceType, setServiceType] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }

    const parsed = JSON.parse(userInfo);
    if (parsed.role !== 'partner') {
      navigate('/', { replace: true });
      return;
    }

    if (!parsed.service_type) {
      navigate('/role-selection', { replace: true });
      return;
    }

    setServiceType(parsed.service_type || '');
    setPartnerName(parsed.full_name || 'Partner');
  }, [navigate]);

  const getDashboardConfig = () => {
    switch (serviceType) {
      case 'hospital':
        return {
          title: 'Hospital Partner Dashboard',
          subtitle: 'Manage your hospital operations',
          cards: [
            { icon: Calendar, title: 'Active Appointments', description: 'View and manage bookings', action: 'View Appointments' },
            { icon: Hospital, title: 'Hospital Data', description: 'Update beds, costs, specialties', action: 'Manage Data' },
            { icon: BarChart3, title: 'Revenue', description: 'View financial reports', action: 'View Revenue' },
          ]
        };
      case 'elder_expert':
        return {
          title: 'Elder Expert Dashboard',
          subtitle: 'Traditional advice & guidance',
          cards: [
            { icon: MessageSquare, title: 'Advice Posts', description: 'Create and manage advice', action: 'Manage Posts' },
            { icon: Users, title: 'Inbox', description: 'Answer user questions', action: 'View Messages' },
            { icon: BarChart3, title: 'Profile', description: 'Track engagement stats', action: 'View Profile' },
          ]
        };
      case 'doctor':
        return {
          title: 'Doctor Dashboard',
          subtitle: 'Manage consultations & patients',
          cards: [
            { icon: Users, title: 'My Patients', description: 'View patient records', action: 'View Patients' },
            { icon: Calendar, title: 'Upcoming Consultations', description: 'Accept/reject appointments', action: 'View Schedule' },
            { icon: DollarSign, title: 'Earnings', description: 'Track consultation fees', action: 'View Earnings' },
          ]
        };
      case 'ambulance':
        return {
          title: 'Emergency Services Dashboard',
          subtitle: 'SOS response & navigation',
          cards: [
            { icon: Ambulance, title: 'Active SOS Cases', description: 'Current emergency alerts', action: 'View Cases' },
            { icon: Navigation, title: 'Navigation', description: 'Live map & routing', action: 'Open Map' },
            { icon: FileText, title: 'History', description: 'Past emergency responses', action: 'View History' },
          ]
        };
      case 'pharmacist':
        return {
          title: 'Pharmacist Dashboard',
          subtitle: 'Manage medicine catalog',
          cards: [
            { icon: Pill, title: 'Medicine Stock', description: 'Update inventory', action: 'Manage Stock' },
            { icon: ShoppingCart, title: 'Orders', description: 'Process refill requests', action: 'View Orders' },
            { icon: Calendar, title: 'Notifications', description: 'Reminder approvals', action: 'View Notifications' },
          ]
        };
      case 'price_comparison':
        return {
          title: 'Price Comparison Dashboard',
          subtitle: 'Medicine pricing management',
          cards: [
            { icon: DollarSign, title: 'Price Updates', description: 'Update medicine pricing', action: 'Update Prices' },
            { icon: PackageCheck, title: 'Refill Requests', description: 'Compete on refill orders', action: 'View Requests' },
            { icon: BarChart3, title: 'Analytics', description: 'Sales performance', action: 'View Analytics' },
          ]
        };
      case 'dietitian':
        return {
          title: 'Dietitian Dashboard',
          subtitle: 'Diet plans & food booking',
          cards: [
            { icon: ClipboardList, title: 'Meal Plans', description: 'Create and manage plans', action: 'Manage Plans' },
            { icon: ShoppingCart, title: 'Active Orders', description: 'Food booking orders', action: 'View Orders' },
            { icon: DollarSign, title: 'Earnings', description: 'Track revenue', action: 'View Earnings' },
          ]
        };
      case 'mental_health':
        return {
          title: 'Mental Health Dashboard',
          subtitle: 'Sessions & nursing care',
          cards: [
            { icon: Calendar, title: 'Appointments', description: 'Accept session bookings', action: 'View Appointments' },
            { icon: ClipboardList, title: 'Tasks', description: 'Nursing care tasks', action: 'View Tasks' },
            { icon: Users, title: 'Profile', description: 'Your professional profile', action: 'View Profile' },
          ]
        };
      case 'pregnancy_care':
        return {
          title: 'Pregnancy Care Dashboard',
          subtitle: 'Care guidance & checkups',
          cards: [
            { icon: Users, title: 'Patients', description: 'Manage expecting mothers', action: 'View Patients' },
            { icon: ClipboardList, title: 'Care Plans', description: 'Weekly care guidance', action: 'Manage Plans' },
            { icon: Calendar, title: 'Checkups', description: 'Schedule appointments', action: 'View Schedule' },
          ]
        };
      case 'fitness':
        return {
          title: 'Fitness Partner Dashboard',
          subtitle: 'Workout sessions & tracking',
          cards: [
            { icon: Dumbbell, title: 'Sessions', description: 'Upload workout plans', action: 'Manage Sessions' },
            { icon: Calendar, title: 'Bookings', description: 'Track attendance', action: 'View Bookings' },
            { icon: DollarSign, title: 'Revenue', description: 'Financial overview', action: 'View Revenue' },
          ]
        };
      case 'insurance':
        return {
          title: 'Insurance Partner Dashboard',
          subtitle: 'Policies & claims management',
          cards: [
            { icon: Shield, title: 'Policies', description: 'Manage insurance plans', action: 'View Policies' },
            { icon: FileText, title: 'Claims', description: 'Verify and process claims', action: 'View Claims' },
            { icon: BarChart3, title: 'Revenue', description: 'Financial reports', action: 'View Revenue' },
          ]
        };
      default:
        return {
          title: 'Partner Dashboard',
          subtitle: 'Please complete your profile setup',
          cards: [
            { icon: Users, title: 'Setup Required', description: 'Complete your partner profile', action: 'Setup Now' },
          ]
        };
    }
  };

  const config = getDashboardConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{config.title}</h1>
            <p className="text-muted-foreground">{config.subtitle}</p>
            <p className="text-sm text-muted-foreground mt-1">Welcome, {partnerName}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {config.cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">{card.action}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;