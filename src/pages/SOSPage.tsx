import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, AlertTriangle, MapPin, Phone, Clock, CheckCircle, 
  Navigation, Users, Truck, User, Loader2 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AmbulanceMap from "@/components/AmbulanceMap";
import EmergencyContacts from "@/components/EmergencyContacts";

interface SOSEvent {
  id: string;
  user_id: string;
  location: { latitude: number; longitude: number };
  status: string;
  ambulance_tracking_id: string | null;
  estimated_arrival: string | null;
  ambulance_location: { latitude: number; longitude: number } | null;
  notes: string | null;
  symptoms: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
  vehicle_type: string | null;
  created_at: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  notify_on_sos: boolean;
}

const SOSPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sosEvent, setSosEvent] = useState<SOSEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
    if (userInfo.id) {
      setUserId(userInfo.id);
    }
    checkActiveSOS();
  }, []);

  const checkActiveSOS = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
      const { data, error } = await supabase
        .from('sos_events')
        .select('*')
        .eq('user_id', userInfo.id)
        .in('status', ['initiated', 'accepted', 'en_route'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const sosData = data as any;
        setSosEvent({
          ...sosData,
          location: sosData.location as { latitude: number; longitude: number },
          ambulance_location: sosData.ambulance_location as { latitude: number; longitude: number } | null
        });
        subscribeToSOSUpdates(sosData.id);
      }
    } catch (error) {
      // No active SOS
    }
  };

  const notifyEmergencyContacts = async (sosId: string, location: { latitude: number; longitude: number }) => {
    const contactsToNotify = emergencyContacts.filter(c => c.notify_on_sos);
    
    if (contactsToNotify.length === 0) return;

    const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
    const userName = userInfo.full_name || 'A user';
    
    toast({
      title: "Emergency Contacts Notified",
      description: `${contactsToNotify.length} contact(s) have been alerted about your emergency`,
    });

    console.log('Notifying emergency contacts:', contactsToNotify.map(c => ({
      name: c.name,
      phone: c.phone_number,
      message: `EMERGENCY: ${userName} has triggered an SOS alert. Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`
    })));
  };

  const handleSOSButtonClick = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGettingLocation(false);
        setShowConfirmDialog(true);
      },
      (error) => {
        console.error('Location Error:', error);
        toast({
          title: "Location Access Denied",
          description: "Please enable location services to send SOS",
          variant: "destructive"
        });
        setGettingLocation(false);
      }
    );
  };

  const handleConfirmSOS = async () => {
    if (!currentLocation) return;
    
    setShowConfirmDialog(false);
    setLoading(true);
    
    const locationData = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timestamp: new Date().toISOString()
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
      
      // Create SOS event with symptoms
      const { data: sosData, error: sosError } = await supabase
        .from('sos_events')
        .insert({
          user_id: userInfo.id,
          location: locationData,
          status: 'initiated',
          notes: 'Emergency assistance requested',
          symptoms: symptoms || 'Not specified'
        })
        .select()
        .single();

      if (sosError) throw sosError;

      const typedSosData = sosData as any;
      setSosEvent({
        ...typedSosData,
        location: typedSosData.location as { latitude: number; longitude: number },
        ambulance_location: null
      });

      // Notify emergency contacts
      await notifyEmergencyContacts(typedSosData.id, locationData);

      // Get all ambulance partners to notify them
      const { data: ambulancePartners } = await supabase
        .from('ambulance_partners')
        .select('partner_id')
        .eq('is_available', true);

      // Create notifications for all ambulance partners
      if (ambulancePartners && ambulancePartners.length > 0) {
        const partnerNotifications = ambulancePartners
          .filter(p => p.partner_id)
          .map(partner => ({
            partner_id: partner.partner_id,
            type: 'sos',
            title: '🚨 NEW SOS EMERGENCY',
            message: `Emergency request from ${userInfo.full_name || 'a user'}. Symptoms: ${symptoms || 'Not specified'}. Respond immediately!`,
          }));

        if (partnerNotifications.length > 0) {
          await supabase
            .from('partner_notifications')
            .insert(partnerNotifications);
        }
      }

      // Create a notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: userInfo.id,
          type: 'sos',
          title: '🚨 SOS Alert Sent',
          message: `Your emergency request has been sent to ${ambulancePartners?.length || 0} nearby ambulance services. Stay calm, help is on the way.`,
          action_url: '/sos'
        });

      toast({
        title: "SOS Alert Sent!",
        description: `Emergency services have been notified. Stay calm, help is on the way.`,
      });

      // Subscribe to updates
      subscribeToSOSUpdates(typedSosData.id);
      setSymptoms("");
    } catch (error) {
      console.error('SOS Error:', error);
      toast({
        title: "SOS Alert Failed",
        description: "Please try again or call emergency services directly",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSOSUpdates = (sosId: string) => {
    const channel = supabase
      .channel(`sos-updates-${sosId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sos_events',
          filter: `id=eq.${sosId}`
        },
        (payload) => {
          const newData = payload.new as any;
          setSosEvent({
            ...newData,
            location: newData.location as { latitude: number; longitude: number },
            ambulance_location: newData.ambulance_location as { latitude: number; longitude: number } | null
          });
          
          if (newData.status === 'accepted') {
            toast({
              title: "🚑 Ambulance Dispatched!",
              description: `Driver ${newData.driver_name || 'Unknown'} is on the way`,
            });
          } else if (newData.status === 'en_route' && newData.ambulance_location) {
            toast({
              title: "Ambulance Update",
              description: "Ambulance location updated - tracking in real-time",
            });
          } else if (newData.status === 'arrived') {
            toast({
              title: "🎉 Ambulance Arrived!",
              description: "The ambulance has reached your location",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'initiated':
        return { color: 'bg-yellow-500', text: 'Finding Ambulance...', icon: Loader2, animate: true };
      case 'accepted':
        return { color: 'bg-blue-500', text: 'Ambulance Dispatched', icon: Navigation, animate: false };
      case 'en_route':
        return { color: 'bg-blue-600', text: 'On The Way', icon: Navigation, animate: true };
      case 'arrived':
        return { color: 'bg-green-500', text: 'Arrived', icon: CheckCircle, animate: false };
      case 'completed':
        return { color: 'bg-gray-500', text: 'Completed', icon: CheckCircle, animate: false };
      default:
        return { color: 'bg-gray-500', text: status, icon: Clock, animate: false };
    }
  };

  const cancelSOS = async () => {
    if (!sosEvent) return;
    
    try {
      const { error } = await supabase
        .from('sos_events')
        .update({ status: 'cancelled' })
        .eq('id', sosEvent.id);

      if (error) throw error;

      setSosEvent(null);
      toast({
        title: "SOS Cancelled",
        description: "Your emergency request has been cancelled",
      });
    } catch (error) {
      console.error('Cancel Error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel SOS. Please try again.",
        variant: "destructive"
      });
    }
  };

  const StatusIcon = sosEvent ? getStatusInfo(sosEvent.status).icon : Clock;
  const statusAnimate = sosEvent ? getStatusInfo(sosEvent.status).animate : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/user-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-destructive">Emergency SOS</h1>
              <p className="text-sm text-muted-foreground">Quick emergency assistance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6 max-w-2xl pb-24">
        {!sosEvent ? (
          <>
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  Emergency Alert
                </CardTitle>
                <CardDescription>
                  Press the button below to send an emergency alert to nearby ambulance services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">What happens when you press SOS:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• You'll describe your symptoms/situation</li>
                    <li>• Your current location is shared with emergency services</li>
                    <li>• Nearest ambulance drivers are notified instantly</li>
                    <li>• You can track the ambulance in real-time on the map</li>
                    <li>• Emergency contacts are notified automatically</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSOSButtonClick}
                  disabled={loading || gettingLocation}
                  size="lg"
                  variant="destructive"
                  className="w-full h-24 text-2xl font-bold animate-pulse hover:animate-none"
                >
                  <AlertTriangle className="mr-3 h-8 w-8" />
                  {gettingLocation ? "GETTING LOCATION..." : loading ? "SENDING SOS..." : "SEND SOS ALERT"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  For life-threatening emergencies, also call local emergency services (911/108/112)
                </p>
              </CardContent>
            </Card>

            {/* Emergency Contacts Section */}
            {userId && (
              <EmergencyContacts 
                userId={userId} 
                onContactsChange={setEmergencyContacts}
              />
            )}

            {/* Quick Call Options */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="tel:108" className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">108 - Ambulance</p>
                      <p className="text-xs text-muted-foreground">Government Emergency</p>
                    </div>
                  </div>
                  <span className="text-primary font-medium">Call →</span>
                </a>
                <a href="tel:112" className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">112 - Emergency</p>
                      <p className="text-xs text-muted-foreground">Universal Emergency Number</p>
                    </div>
                  </div>
                  <span className="text-primary font-medium">Call →</span>
                </a>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Active SOS Status Card */}
            <Card className="border-primary/50 overflow-hidden">
              <div className={`h-2 ${getStatusInfo(sosEvent.status).color}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active SOS Request</CardTitle>
                  <Badge className={`${getStatusInfo(sosEvent.status).color} text-white`}>
                    <StatusIcon className={`h-4 w-4 mr-1 ${statusAnimate ? 'animate-spin' : ''}`} />
                    {getStatusInfo(sosEvent.status).text}
                  </Badge>
                </div>
                <CardDescription>
                  Request ID: {sosEvent.id.substring(0, 8)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Finding Ambulance Animation */}
                {sosEvent.status === 'initiated' && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center animate-ping absolute" />
                      <div className="h-20 w-20 rounded-full bg-yellow-500/30 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold">Finding ambulance near you...</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Your request has been sent to nearby ambulance drivers. 
                      Please stay calm and keep your phone nearby.
                    </p>
                  </div>
                )}

                {/* Driver Info Card - Show when accepted */}
                {(sosEvent.status === 'accepted' || sosEvent.status === 'en_route' || sosEvent.status === 'arrived') && sosEvent.driver_name && (
                  <Card className="border-green-500/50 bg-green-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Driver</p>
                            <p className="text-lg font-bold">{sosEvent.driver_name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Vehicle</p>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                {sosEvent.vehicle_number || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Type</p>
                              <p className="text-sm font-medium">{sosEvent.vehicle_type || 'Ambulance'}</p>
                            </div>
                          </div>
                          {sosEvent.driver_phone && (
                            <a 
                              href={`tel:${sosEvent.driver_phone}`}
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                              <Phone className="h-4 w-4" />
                              Call Driver: {sosEvent.driver_phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Real-time Map */}
                <AmbulanceMap 
                  userLocation={sosEvent.location}
                  ambulanceLocation={sosEvent.ambulance_location}
                  status={sosEvent.status}
                />

                {/* Estimated Arrival */}
                {sosEvent.estimated_arrival && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Estimated Arrival</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sosEvent.estimated_arrival).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tracking ID */}
                {sosEvent.ambulance_tracking_id && (
                  <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                    <Navigation className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Ambulance Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {sosEvent.ambulance_tracking_id}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notified Contacts */}
                {emergencyContacts.filter(c => c.notify_on_sos).length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Contacts Notified</p>
                      <p className="text-sm text-muted-foreground">
                        {emergencyContacts.filter(c => c.notify_on_sos).map(c => c.name).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Emergency call */}
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Emergency Contact:</p>
                  <a 
                    href="tel:108" 
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    Call 108 (Ambulance)
                  </a>
                </div>

                {/* Cancel Button - Only show for initiated status */}
                {sosEvent.status === 'initiated' && (
                  <Button 
                    variant="outline" 
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                    onClick={cancelSOS}
                  >
                    Cancel SOS Request
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Send Emergency Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will alert nearby ambulance drivers and share your location. 
              Please describe your symptoms or situation below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Describe symptoms/situation (optional)</Label>
              <Textarea
                id="symptoms"
                placeholder="e.g., Chest pain, difficulty breathing, accident..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            {currentLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location captured: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</span>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSOS}
              className="bg-destructive hover:bg-destructive/90"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Confirm SOS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SOSPage;
