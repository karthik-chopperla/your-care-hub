import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar as CalendarIcon } from "lucide-react";

const BookingDialog = ({ hospital, open, onClose }) => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDoctors();
    }
  }, [open]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('verification_status', 'verified')
        .limit(10);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a doctor, date, and time",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
      
      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: userInfo.id,
          hospital_id: hospital.id,
          doctor_id: selectedDoctor,
          appointment_type: 'consultation',
          scheduled_at: new Date(`${selectedDate.toDateString()} ${selectedTime}`).toISOString(),
          status: 'scheduled'
        });

      if (appointmentError) throw appointmentError;

      // Create notification for hospital partner
      await supabase
        .from('notifications')
        .insert({
          user_id: userInfo.id,
          type: 'appointment',
          title: 'New Appointment Booking',
          message: `${userInfo.full_name} booked an appointment at ${hospital.name} on ${selectedDate.toDateString()} at ${selectedTime}`,
          action_url: '/partner/appointments'
        });

      toast({
        title: "Booking Confirmed!",
        description: `Your appointment is scheduled for ${selectedDate.toDateString()} at ${selectedTime}`
      });

      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment at {hospital?.name}</DialogTitle>
          <DialogDescription>
            Select a doctor, date, and time for your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Selection */}
          <div>
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Doctor
            </label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{doctor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {doctor.specialty} • ₹{doctor.charges || 0}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Select Time</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBooking}
            disabled={loading || !selectedDoctor || !selectedDate || !selectedTime}
            className="w-full"
            size="lg"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
