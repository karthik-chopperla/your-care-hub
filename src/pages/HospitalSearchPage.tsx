import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Phone, Mail, Star, Bed, Users, Calendar } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";

const HospitalSearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('ratings', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      toast({
        title: "Error",
        description: "Failed to load hospitals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.facilities?.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBookAppointment = (hospital) => {
    setSelectedHospital(hospital);
    setShowBookingDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/user-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Find Hospitals</h1>
              <p className="text-sm text-muted-foreground">Locate nearby healthcare facilities</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Search by hospital name, city, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Hospitals List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading hospitals...</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hospitals found</p>
            </div>
          ) : (
            filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {hospital.address}, {hospital.city}, {hospital.state}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{hospital.ratings || 0}</span>
                      <span className="text-sm text-muted-foreground">({hospital.total_ratings || 0})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Facilities */}
                  {hospital.facilities && hospital.facilities.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Facilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.facilities.map((facility, idx) => (
                          <Badge key={idx} variant="secondary">{facility}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bed Availability */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">General Beds</p>
                        <p className="font-semibold">{hospital.general_beds || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="text-xs text-muted-foreground">ICU Beds</p>
                        <p className="font-semibold">{hospital.icu_beds || 0}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost Index</p>
                      <Badge variant={hospital.cost_index === 'LOW' ? 'default' : hospital.cost_index === 'HIGH' ? 'destructive' : 'secondary'}>
                        {hospital.cost_index || 'MEDIUM'}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {hospital.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{hospital.phone_number}</span>
                      </div>
                    )}
                    {hospital.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{hospital.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleBookAppointment(hospital)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                    {hospital.emergency_services && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        Emergency Available
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {showBookingDialog && (
        <BookingDialog
          hospital={selectedHospital}
          open={showBookingDialog}
          onClose={() => {
            setShowBookingDialog(false);
            setSelectedHospital(null);
          }}
        />
      )}
    </div>
  );
};

export default HospitalSearchPage;
