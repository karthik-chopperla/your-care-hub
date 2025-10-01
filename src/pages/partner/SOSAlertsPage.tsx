import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle, MapPin, Clock, CheckCircle, XCircle, Navigation } from "lucide-react";

const SOSAlertsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (user.role !== 'partner' || user.service_type !== 'ambulance') {
      navigate('/partner-dashboard', { replace: true });
      return;
    }

    loadSOSAlerts();
    subscribeToSOSAlerts();
  }, [navigate]);

  const loadSOSAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('sos_events')
        .select('*, user_info(full_name, phone_number)')
        .in('status', ['initiated', 'accepted', 'en_route'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSosAlerts(data || []);
    } catch (error) {
      console.error('Error loading SOS alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load SOS alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSOSAlerts = () => {
    const channel = supabase
      .channel('sos-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_events'
        },
        (payload) => {
          // Play sound or show notification
          toast({
            title: "🚨 NEW SOS ALERT!",
            description: "Emergency request received",
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

  const handleAcceptSOS = async (sosId) => {
    try {
      const trackingId = `AMB-${Date.now()}`;
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + 15);

      const { error } = await supabase
        .from('sos_events')
        .update({
          status: 'accepted',
          ambulance_tracking_id: trackingId,
          estimated_arrival: estimatedArrival.toISOString()
        })
        .eq('id', sosId);

      if (error) throw error;

      toast({
        title: "SOS Accepted",
        description: "You have accepted this emergency request. Navigate to location.",
      });

      loadSOSAlerts();
    } catch (error) {
      console.error('Error accepting SOS:', error);
      toast({
        title: "Error",
        description: "Failed to accept SOS request",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (sosId, newStatus) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'arrived') {
        updates.actual_arrival = new Date().toISOString();
      }

      const { error } = await supabase
        .from('sos_events')
        .update(updates)
        .eq('id', sosId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `SOS status updated to: ${newStatus}`,
      });

      loadSOSAlerts();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleRejectSOS = async (sosId) => {
    try {
      const { error } = await supabase
        .from('sos_events')
        .update({ status: 'cancelled' })
        .eq('id', sosId);

      if (error) throw error;

      toast({
        title: "SOS Rejected",
        description: "This request has been rejected",
      });

      loadSOSAlerts();
    } catch (error) {
      console.error('Error rejecting SOS:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'initiated':
        return <Badge variant="destructive">NEW ALERT</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-500">ACCEPTED</Badge>;
      case 'en_route':
        return <Badge className="bg-blue-600">EN ROUTE</Badge>;
      case 'arrived':
        return <Badge className="bg-green-500">ARRIVED</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/partner-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-destructive">SOS Emergency Alerts</h1>
              <p className="text-sm text-muted-foreground">Active emergency requests</p>
            </div>
            {sosAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-auto text-lg px-3 py-1">
                {sosAlerts.length} Active
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading SOS alerts...</p>
          </div>
        ) : sosAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">No Active SOS Alerts</p>
              <p className="text-sm text-muted-foreground">Emergency requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          sosAlerts.map((sos) => (
            <Card key={sos.id} className="border-destructive/50 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-6 w-6 animate-pulse" />
                      EMERGENCY REQUEST
                    </CardTitle>
                    <CardDescription>
                      Requested: {new Date(sos.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(sos.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Patient Information</p>
                  <p className="text-sm">Name: {sos.user_info?.full_name || 'Unknown'}</p>
                  {sos.user_info?.phone_number && (
                    <p className="text-sm">Phone: {sos.user_info.phone_number}</p>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Emergency Location</p>
                    <p className="text-sm text-muted-foreground">
                      Lat: {sos.location?.latitude?.toFixed(6)}, 
                      Lng: {sos.location?.longitude?.toFixed(6)}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${sos.location?.latitude},${sos.location?.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Open in Google Maps →
                    </Button>
                  </div>
                </div>

                {/* Tracking Info */}
                {sos.ambulance_tracking_id && (
                  <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                    <Navigation className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Tracking ID</p>
                      <p className="text-sm text-muted-foreground">{sos.ambulance_tracking_id}</p>
                    </div>
                  </div>
                )}

                {/* ETA */}
                {sos.estimated_arrival && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Estimated Arrival</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sos.estimated_arrival).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {sos.status === 'initiated' && (
                    <>
                      <Button
                        onClick={() => handleAcceptSOS(sos.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectSOS(sos.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}

                  {sos.status === 'accepted' && (
                    <Button
                      onClick={() => handleUpdateStatus(sos.id, 'en_route')}
                      className="flex-1"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Mark En Route
                    </Button>
                  )}

                  {sos.status === 'en_route' && (
                    <Button
                      onClick={() => handleUpdateStatus(sos.id, 'arrived')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Arrived
                    </Button>
                  )}

                  {sos.status === 'arrived' && (
                    <Button
                      onClick={() => handleUpdateStatus(sos.id, 'completed')}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default SOSAlertsPage;
