import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, BarChart3, Hospital, Stethoscope, Ambulance, Pill, DollarSign, Utensils, Brain, Baby, Dumbbell, Shield, MessageSquare, PackageCheck, Navigation, ShoppingCart, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";

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
            { icon: Calendar, title: 'Active Appointments', description: 'View and manage bookings', action: 'View Appointments', path: '/partner/appointments' },
            { icon: Hospital, title: 'Hospital Data', description: 'Update beds, costs, specialties', action: 'Manage Data', path: '/partner/hospital-data' },
            { icon: BarChart3, title: 'Revenue', description: 'View financial reports', action: 'View Revenue', path: '/partner/revenue' },
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
            { icon: Ambulance, title: 'Active SOS Cases', description: 'Current emergency alerts', action: 'View Cases', path: '/partner/sos-alerts' },
            { icon: Navigation, title: 'Navigation', description: 'Live map & routing', action: 'Open Map', path: '/partner/navigation' },
            { icon: FileText, title: 'History', description: 'Past emergency responses', action: 'View History', path: '/partner/history' },
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
    <MobileLayout>
      <MobileHeader title="Partner Dashboard" showBack={false} />
      
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          <p className="text-xs text-muted-foreground">Welcome, {partnerName}</p>
        </div>

        {/* Dashboard Cards */}
        <div className="space-y-4">
          {config.cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="mobile-card">
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{card.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => card.path && navigate(card.path)}
                  >
                    {card.action}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default PartnerDashboard;