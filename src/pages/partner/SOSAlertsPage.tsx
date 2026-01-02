import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, AlertTriangle, MapPin, Phone, Clock, CheckCircle, 
  Navigation, User, Loader2, Bell, X, Truck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SOSAlert {
  id: string;
  user_id: string;
  location: { latitude: number; longitude: number };
  status: string;
  symptoms: string | null;
  notes: string | null;
  created_at: string;
  estimated_arrival: string | null;
  ambulance_tracking_id: string | null;
}

interface UserInfo {
  full_name: string;
  phone_number: string;
}

export default function SOSAlertsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth(true);
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ambulanceInfo, setAmbulanceInfo] = useState<any>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (loading) return;
      if (!user) { navigate("/auth"); return; }
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleData?.role !== 'partner') { 
        navigate("/user-dashboard"); 
        return; 
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('service_type')
        .eq('id', user.id)
        .single();
      
      if (profileData?.service_type !== 'ambulance') {
        navigate("/partner-dashboard");
        return;
      }

      // Get ambulance info
      const { data: ambData } = await supabase
        .from('ambulance_partners')
        .select('*')
        .eq('partner_id', user.id)
        .limit(1)
        .single();
      
      if (ambData) {
        setAmbulanceInfo(ambData);
      }
      
      loadSOSAlerts();
      const unsubscribe = subscribeToSOSAlerts();
      return unsubscribe;
    };
    
    checkUserRole();
  }, [user, loading, navigate]);

  const loadSOSAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('sos_events')
        .select('*')
        .in('status', ['initiated', 'accepted', 'en_route'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map((item: any) => ({
        ...item,
        location: item.location as { latitude: number; longitude: number }
      }));
      
      setAlerts(typedData);
    } catch (error: any) {
      console.error('Error loading SOS alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load SOS alerts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToSOSAlerts = () => {
    const channel = supabase
      .channel('sos-alerts-partner')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_events'
        },
        (payload) => {
          // Play notification sound or vibrate
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          toast({
            title: "🚨 NEW SOS ALERT!",
            description: "Emergency request received. Check immediately!",
          });
          loadSOSAlerts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sos_events'
        },
        () => {
          loadSOSAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAcceptSOS = async (sosId: string) => {
    if (!ambulanceInfo) {
      toast({
        title: "Error",
        description: "No ambulance profile found. Please set up your ambulance first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const trackingId = `AMB-${Date.now().toString(36).toUpperCase()}`;
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + 15);

      const { error } = await supabase
        .from('sos_events')
        .update({
          status: 'accepted',
          ambulance_tracking_id: trackingId,
          estimated_arrival: estimatedArrival.toISOString(),
          driver_name: ambulanceInfo.driver_name,
          driver_phone: ambulanceInfo.phone_number,
          vehicle_number: ambulanceInfo.vehicle_number,
          vehicle_type: ambulanceInfo.vehicle_type || 'Ambulance'
        })
        .eq('id', sosId)
        .eq('status', 'initiated'); // Only accept if still initiated

      if (error) throw error;

      toast({
        title: "✅ SOS Accepted",
        description: "Navigate to the patient location immediately.",
      });

      loadSOSAlerts();
    } catch (error: any) {
      console.error('Error accepting SOS:', error);
      toast({
        title: "Error",
        description: "Failed to accept SOS request. It may have been taken by another driver.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (sosId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'arrived') {
        updates.actual_arrival = new Date().toISOString();
      }

      // Update ambulance location when en_route
      if (newStatus === 'en_route') {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            updates.ambulance_location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            const { error } = await supabase
              .from('sos_events')
              .update(updates)
              .eq('id', sosId);

            if (error) throw error;

            toast({
              title: "Status Updated",
              description: `Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
            });

            loadSOSAlerts();
          },
          (error) => {
            console.error('Location error:', error);
            // Update without location
            updateStatusWithoutLocation(sosId, updates);
          }
        );
        return;
      }

      const { error } = await supabase
        .from('sos_events')
        .update(updates)
        .eq('id', sosId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
      });

      loadSOSAlerts();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const updateStatusWithoutLocation = async (sosId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('sos_events')
        .update(updates)
        .eq('id', sosId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Status updated (location not available)",
      });

      loadSOSAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleRejectSOS = async (sosId: string) => {
    try {
      // Just remove from our view, don't cancel it
      setAlerts(prev => prev.filter(a => a.id !== sosId));
      toast({
        title: "Alert Dismissed",
        description: "Another driver can still accept this request.",
      });
    } catch (error) {
      console.error('Error dismissing SOS:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'initiated':
        return <Badge className="bg-yellow-500 animate-pulse">🆘 New Alert</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-500">✅ Accepted</Badge>;
      case 'en_route':
        return <Badge className="bg-blue-600">🚗 En Route</Badge>;
      case 'arrived':
        return <Badge className="bg-green-500">📍 Arrived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initiatedAlerts = alerts.filter(a => a.status === 'initiated');
  const activeAlerts = alerts.filter(a => a.status !== 'initiated');

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/partner/ambulance')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-destructive flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  SOS Alerts
                </h1>
                <p className="text-sm text-muted-foreground">
                  {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {ambulanceInfo && (
              <div className="text-right">
                <p className="text-sm font-medium">{ambulanceInfo.vehicle_number}</p>
                <p className="text-xs text-muted-foreground">{ambulanceInfo.driver_name}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6 max-w-2xl pb-24">
        {/* New Alerts Section */}
        {initiatedAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              New Emergency Requests ({initiatedAlerts.length})
            </h2>
            
            {initiatedAlerts.map((sos) => (
              <Card key={sos.id} className="border-destructive/50 bg-destructive/5 animate-pulse-slow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Emergency SOS
                    </CardTitle>
                    {getStatusBadge(sos.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(sos.created_at)} ({getTimeAgo(sos.created_at)})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Symptoms */}
                  {sos.symptoms && (
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">
                        Reported Symptoms
                      </p>
                      <p className="text-sm font-medium">{sos.symptoms}</p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Emergency Location</p>
                      <p className="text-sm text-muted-foreground">
                        {sos.location?.latitude?.toFixed(6)}, {sos.location?.longitude?.toFixed(6)}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-primary"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${sos.location?.latitude},${sos.location?.longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Open Navigation →
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptSOS(sos.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Case
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectSOS(sos.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Cases Section */}
        {activeAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Your Active Cases ({activeAlerts.length})
            </h2>
            
            {activeAlerts.map((sos) => (
              <Card key={sos.id} className="border-primary/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Case #{sos.ambulance_tracking_id || sos.id.substring(0, 8)}
                    </CardTitle>
                    {getStatusBadge(sos.status)}
                  </div>
                  <CardDescription>
                    Started: {formatTime(sos.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Symptoms */}
                  {sos.symptoms && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                        Symptoms
                      </p>
                      <p className="text-sm">{sos.symptoms}</p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Patient Location</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${sos.location?.latitude},${sos.location?.longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Open Navigation →
                      </Button>
                    </div>
                  </div>

                  {/* ETA */}
                  {sos.estimated_arrival && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>ETA: {new Date(sos.estimated_arrival).toLocaleTimeString()}</span>
                    </div>
                  )}

                  {/* Status Update Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {sos.status === 'accepted' && (
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleUpdateStatus(sos.id, 'en_route')}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Start En Route
                      </Button>
                    )}
                    {sos.status === 'en_route' && (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateStatus(sos.id, 'arrived')}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Mark Arrived
                      </Button>
                    )}
                    {sos.status === 'arrived' && (
                      <Button 
                        className="flex-1"
                        onClick={() => handleUpdateStatus(sos.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Case
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {alerts.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active SOS Alerts</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                You'll be notified immediately when a new emergency request comes in. 
                Keep this page open for real-time updates.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
