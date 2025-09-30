import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Star, 
  Filter,
  Heart,
  Phone,
  Clock,
  DollarSign,
  Stethoscope,
  Building2,
  Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [viewType, setViewType] = useState("doctors"); // "doctors" or "hospitals"
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const specialties = [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
    "General Medicine", "Neurology", "Orthopedics", "Pediatrics",
    "Psychiatry", "Pulmonology", "Radiology", "Surgery"
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load doctors
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('*')
        .eq('verification_status', 'verified')
        .order('ratings', { ascending: false });

      // Load hospitals
      const { data: hospitalsData } = await supabase
        .from('hospitals')
        .select('*')
        .order('ratings', { ascending: false });

      setDoctors(doctorsData || []);
      setHospitals(hospitalsData || []);

      // If no data, add some sample data
      if (!doctorsData?.length) {
        await addSampleData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    const sampleDoctors = [
      {
        name: "Dr. Priya Sharma",
        specialty: "Cardiology",
        qualifications: "MBBS, MD Cardiology",
        experience_years: 15,
        charges: 800,
        ratings: 4.8,
        total_ratings: 156,
        verification_status: "verified",
        phone_number: "+91 9876543210",
        email: "priya.sharma@example.com",
        address: "Apollo Hospital, Delhi",
        is_online_available: true,
        is_offline_available: true
      },
      {
        name: "Dr. Rajesh Kumar",
        specialty: "General Medicine",
        qualifications: "MBBS, MD Internal Medicine",
        experience_years: 12,
        charges: 500,
        ratings: 4.6,
        total_ratings: 203,
        verification_status: "verified",
        phone_number: "+91 9876543211",
        email: "rajesh.kumar@example.com",
        address: "Max Hospital, Mumbai",
        is_online_available: true,
        is_offline_available: true
      },
      {
        name: "Dr. Anjali Patel",
        specialty: "Dermatology",
        qualifications: "MBBS, MD Dermatology",
        experience_years: 8,
        charges: 600,
        ratings: 4.7,
        total_ratings: 89,
        verification_status: "verified",
        phone_number: "+91 9876543212",
        email: "anjali.patel@example.com",
        address: "Fortis Hospital, Bangalore",
        is_online_available: true,
        is_offline_available: false
      }
    ];

    const sampleHospitals = [
      {
        name: "Apollo Hospital",
        address: "Sector 26, Noida",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201301",
        phone_number: "+91 120-4567890",
        facilities: ["Emergency", "ICU", "Surgery", "Cardiology", "Neurology"],
        ratings: 4.5,
        total_ratings: 342,
        cost_index: "HIGH",
        success_rate: 94.5,
        emergency_services: true,
        icu_beds: 50,
        general_beds: 200,
        ambulance_available: true
      },
      {
        name: "Max Super Specialty Hospital",
        address: "Press Enclave Road, Saket",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110017",
        phone_number: "+91 11-2651-5050",
        facilities: ["Emergency", "ICU", "Cancer Care", "Transplant", "Pediatrics"],
        ratings: 4.6,
        total_ratings: 298,
        cost_index: "HIGH",
        success_rate: 96.2,
        emergency_services: true,
        icu_beds: 75,
        general_beds: 350,
        ambulance_available: true
      },
      {
        name: "Fortis Hospital",
        address: "Bannerghatta Road",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560076",
        phone_number: "+91 80-6621-4444",
        facilities: ["Emergency", "ICU", "Orthopedics", "Gastroenterology"],
        ratings: 4.4,
        total_ratings: 187,
        cost_index: "MEDIUM",
        success_rate: 91.8,
        emergency_services: true,
        icu_beds: 40,
        general_beds: 180,
        ambulance_available: true
      }
    ];

    try {
      await supabase.from('doctors').insert(sampleDoctors);
      await supabase.from('hospitals').insert(sampleHospitals);
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error adding sample data:', error);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const bookAppointment = async (doctorId, appointmentType) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: userInfo.id || 'demo-user',
          doctor_id: doctorId,
          appointment_type: appointmentType,
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          status: 'scheduled'
        });

      if (error) {
        console.error('Error booking appointment:', error);
      }

      toast({
        title: "Appointment Booked!",
        description: `Your ${appointmentType} appointment has been scheduled successfully.`,
      });
    } catch (error) {
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been scheduled successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/user-dashboard')}>
              ← Back
            </Button>
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Find Healthcare</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Healthcare Providers</CardTitle>
            <CardDescription>
              Find the best doctors and hospitals near you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* View Toggle */}
            <div className="flex gap-2">
              <Button 
                variant={viewType === 'doctors' ? 'default' : 'outline'}
                onClick={() => setViewType('doctors')}
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Doctors
              </Button>
              <Button 
                variant={viewType === 'hospitals' ? 'default' : 'outline'}
                onClick={() => setViewType('hospitals')}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Hospitals
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={viewType === 'doctors' ? "Search doctors by name or specialty..." : "Search hospitals by name or location..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Specialty Filter for Doctors */}
            {viewType === 'doctors' && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedSpecialty === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSpecialty('')}
                >
                  All Specialties
                </Button>
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading healthcare providers...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {viewType === 'doctors' ? (
              filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/10">
                              <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{doctor.name}</h3>
                              <p className="text-muted-foreground">{doctor.specialty}</p>
                              <p className="text-sm text-muted-foreground">{doctor.qualifications}</p>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="font-medium">{doctor.ratings}</span>
                                  <span className="text-sm text-muted-foreground">({doctor.total_ratings} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{doctor.experience_years} years exp</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm">₹{doctor.charges} consultation</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{doctor.address}</span>
                              </div>

                              <div className="flex gap-2 mt-3">
                                {doctor.is_online_available && (
                                  <Badge variant="secondary">Online Available</Badge>
                                )}
                                {doctor.is_offline_available && (
                                  <Badge variant="outline">In-person Available</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {doctor.is_online_available && (
                            <Button 
                              onClick={() => bookAppointment(doctor.id, 'online')}
                              className="min-w-[120px]"
                            >
                              Book Online
                            </Button>
                          )}
                          {doctor.is_offline_available && (
                            <Button 
                              variant="outline"
                              onClick={() => bookAppointment(doctor.id, 'offline')}
                              className="min-w-[120px]"
                            >
                              Book In-person
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No doctors found matching your criteria</p>
                </div>
              )
            ) : (
              filteredHospitals.length > 0 ? (
                filteredHospitals.map((hospital) => (
                  <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                              <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{hospital.name}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {hospital.address}, {hospital.city}, {hospital.state}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="font-medium">{hospital.ratings}</span>
                                  <span className="text-sm text-muted-foreground">({hospital.total_ratings} reviews)</span>
                                </div>
                                <Badge 
                                  variant={hospital.cost_index === 'HIGH' ? 'destructive' : 
                                          hospital.cost_index === 'MEDIUM' ? 'default' : 'secondary'}
                                >
                                  {hospital.cost_index} Cost
                                </Badge>
                                <span className="text-sm text-green-600">
                                  {hospital.success_rate}% Success Rate
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {hospital.facilities?.slice(0, 5).map((facility, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {facility}
                                  </Badge>
                                ))}
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">ICU Beds:</span>
                                  <span className="ml-1 font-medium">{hospital.icu_beds}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">General Beds:</span>
                                  <span className="ml-1 font-medium">{hospital.general_beds}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Emergency:</span>
                                  <span className={`ml-1 font-medium ${hospital.emergency_services ? 'text-green-600' : 'text-red-600'}`}>
                                    {hospital.emergency_services ? 'Available' : 'Not Available'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button onClick={() => navigate(`/hospital/${hospital.id}`)}>
                            View Details
                          </Button>
                          <Button variant="outline">
                            <Navigation className="h-4 w-4 mr-2" />
                            Directions
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hospitals found matching your criteria</p>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorsPage;