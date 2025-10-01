import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, User, Clock, CheckCircle, XCircle, Phone } from "lucide-react";

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (user.role !== 'partner') {
      navigate('/partner-dashboard', { replace: true });
      return;
    }

    loadAppointments();
    subscribeToAppointments();
  }, [navigate]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, user_info(full_name, phone_number, email), doctors(name, specialty), hospitals(name)')
        .in('status', ['scheduled', 'pending'])
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAppointments = () => {
    const channel = supabase
      .channel('appointments-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          toast({
            title: "New Appointment!",
            description: "A new appointment request has been received",
          });
          loadAppointments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAccept = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment Accepted",
        description: "The patient has been notified",
      });

      loadAppointments();
    } catch (error) {
      console.error('Error accepting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to accept appointment",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment Rejected",
        description: "The patient has been notified",
      });

      loadAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reject appointment",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default">Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/partner-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Appointment Requests</h1>
              <p className="text-sm text-muted-foreground">Manage patient bookings</p>
            </div>
            {appointments.length > 0 && (
              <Badge className="ml-auto text-lg px-3 py-1">
                {appointments.length} Pending
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">No Pending Appointments</p>
              <p className="text-sm text-muted-foreground">Appointment requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Appointment Request
                    </CardTitle>
                    <CardDescription>
                      {new Date(appointment.scheduled_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient Information
                  </p>
                  <div className="grid gap-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{appointment.user_info?.full_name || 'Unknown'}</span>
                    </p>
                    {appointment.user_info?.phone_number && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${appointment.user_info.phone_number}`} className="text-primary hover:underline">
                          {appointment.user_info.phone_number}
                        </a>
                      </p>
                    )}
                    {appointment.user_info?.email && (
                      <p className="text-muted-foreground">Email: {appointment.user_info.email}</p>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  {appointment.doctors && (
                    <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Doctor</p>
                        <p className="text-sm">{appointment.doctors.name}</p>
                        <p className="text-xs text-muted-foreground">{appointment.doctors.specialty}</p>
                      </div>
                    </div>
                  )}

                  {appointment.hospitals && (
                    <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Hospital</p>
                        <p className="text-sm">{appointment.hospitals.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Appointment Type */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Type: <span className="font-medium capitalize">{appointment.appointment_type}</span></span>
                </div>

                {/* Notes */}
                {appointment.consultation_notes && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{appointment.consultation_notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {appointment.status === 'scheduled' && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleAccept(appointment.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Appointment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(appointment.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default AppointmentsPage;
