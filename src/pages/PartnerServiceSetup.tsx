import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { Loader2 } from "lucide-react";

interface ServiceFormData {
  name: string;
  email: string;
  phone_number: string;
  city: string;
  state: string;
  address: string;
  // Hospital specific
  hospital_name?: string;
  general_beds?: number;
  icu_beds?: number;
  cost_index?: string;
  // Doctor specific
  specialization?: string;
  experience_years?: number;
  consultation_fee?: number;
  // Restaurant specific
  restaurant_name?: string;
  cuisine_types?: string;
  // Mental Health specific
  therapy_types?: string;
  session_duration?: number;
  // Fitness specific
  gym_name?: string;
  certifications?: string;
  // Home Nursing specific
  agency_name?: string;
  available_nurses?: number;
  // Insurance specific
  company_name?: string;
  license_number?: string;
}

const serviceTypeLabels: Record<string, string> = {
  'hospital': 'Hospital Partner',
  'doctor': 'Doctor Partner',
  'elder_expert': 'Elder Expert',
  'dietitian': 'Dietitian',
  'restaurant': 'Restaurant Partner',
  'mental_health': 'Mental Health Partner',
  'pregnancy_care': 'Pregnancy Care Partner',
  'fitness': 'Fitness Partner',
  'home_nursing': 'Home Nursing Partner',
  'insurance': 'Insurance Partner',
};

const dashboardMap: Record<string, string> = {
  'hospital': '/partner/hospital-dashboard',
  'doctor': '/partner/gynecologist-dashboard',
  'elder_expert': '/partner/elder-advice-dashboard',
  'dietitian': '/partner/restaurant-dashboard',
  'restaurant': '/partner/restaurant-dashboard',
  'mental_health': '/partner/mental-health-dashboard',
  'pregnancy_care': '/partner/gynecologist-dashboard',
  'fitness': '/partner/fitness-dashboard',
  'home_nursing': '/partner/home-nursing-dashboard',
  'insurance': '/partner/insurance-dashboard',
};

export default function PartnerServiceSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get('type') || '';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    email: '',
    phone_number: '',
    city: '',
    state: '',
    address: '',
    general_beds: 0,
    icu_beds: 0,
    cost_index: 'MEDIUM',
    experience_years: 0,
    consultation_fee: 0,
    session_duration: 60,
    available_nurses: 0,
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone_number')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || '',
          email: profile.email || session.user.email || '',
          phone_number: profile.phone_number || '',
        }));
      }
    };

    if (!serviceType) {
      navigate('/role-selection');
      return;
    }

    loadUserProfile();
  }, [navigate, serviceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Session expired", variant: "destructive" });
        navigate('/auth');
        return;
      }

      // Step 1: Insert partner role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: session.user.id, role: 'partner' });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw new Error(roleError.message);
      }

      // Step 2: Create or get partner record
      let partnerId: string;
      const { data: existingPartner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (existingPartner) {
        partnerId = existingPartner.id;
        // Update service type
        await supabase.from('partners')
          .update({ service_type: serviceType })
          .eq('id', partnerId);
      } else {
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .insert({
            user_id: session.user.id,
            name: formData.name,
            service_type: serviceType,
            email: formData.email,
            phone_number: formData.phone_number,
          })
          .select('id')
          .single();

        if (partnerError || !partnerData) {
          throw new Error('Failed to create partner record');
        }
        partnerId = partnerData.id;
      }

      // Step 3: Create service-specific record
      let serviceError = null;

      switch (serviceType) {
        case 'hospital':
          const { error: hospitalError } = await supabase
            .from('hospitals')
            .insert({
              partner_id: partnerId,
              name: formData.hospital_name || formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              phone_number: formData.phone_number,
              email: formData.email,
              general_beds: formData.general_beds || 0,
              icu_beds: formData.icu_beds || 0,
              cost_index: formData.cost_index || 'MEDIUM',
            });
          serviceError = hospitalError;
          break;

        case 'doctor':
        case 'pregnancy_care':
          const { error: gynError } = await supabase
            .from('gynecologists')
            .insert({
              partner_id: partnerId,
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              location: { address: formData.address },
              experience_years: formData.experience_years || 0,
              consultation_fee: formData.consultation_fee || 0,
              specialization: formData.specialization ? [formData.specialization] : [],
            });
          serviceError = gynError;
          break;

        case 'mental_health':
          const { error: mentalError } = await supabase
            .from('mental_health_partners')
            .insert({
              partner_id: partnerId,
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              location: { address: formData.address },
              experience_years: formData.experience_years || 0,
              consultation_fee: formData.consultation_fee || 0,
              session_duration: formData.session_duration || 60,
              therapy_types: formData.therapy_types ? [formData.therapy_types] : [],
            });
          serviceError = mentalError;
          break;

        case 'fitness':
          const { error: fitnessError } = await supabase
            .from('fitness_partners')
            .insert({
              partner_id: partnerId,
              name: formData.name,
              gym_name: formData.gym_name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              address: formData.address,
              location: { address: formData.address },
              experience_years: formData.experience_years || 0,
              certifications: formData.certifications ? [formData.certifications] : [],
            });
          serviceError = fitnessError;
          break;

        case 'home_nursing':
          const { error: nursingError } = await supabase
            .from('home_nursing_partners')
            .insert({
              partner_id: partnerId,
              agency_name: formData.agency_name || formData.name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              location: { address: formData.address },
              available_nurses: formData.available_nurses || 0,
            });
          serviceError = nursingError;
          break;

        case 'dietitian':
        case 'restaurant':
          const { error: restaurantError } = await supabase
            .from('restaurant_partners')
            .insert({
              partner_id: partnerId,
              name: formData.restaurant_name || formData.name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              address: formData.address,
              location: { address: formData.address },
              cuisine_types: formData.cuisine_types ? [formData.cuisine_types] : [],
            });
          serviceError = restaurantError;
          break;

        case 'insurance':
          const { error: insuranceError } = await supabase
            .from('insurance_partners')
            .insert({
              partner_id: partnerId,
              company_name: formData.company_name || formData.name,
              agent_name: formData.name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              location: { address: formData.address },
              license_number: formData.license_number,
            });
          serviceError = insuranceError;
          break;

        case 'elder_expert':
          const { error: elderError } = await supabase
            .from('elder_experts')
            .insert({
              partner_id: partnerId,
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone_number,
              city: formData.city,
              state: formData.state,
              location: { address: formData.address },
              specialty: formData.specialization || 'Traditional Medicine',
              experience_years: formData.experience_years || 0,
            });
          serviceError = elderError;
          break;
      }

      if (serviceError) {
        console.error('Service creation error:', serviceError);
        throw new Error('Failed to create service profile');
      }

      // Step 4: Update profile with service type
      await supabase
        .from('profiles')
        .update({ service_type: serviceType })
        .eq('id', session.user.id);

      toast({ title: "Partner profile created successfully!" });
      navigate(dashboardMap[serviceType] || '/partner-dashboard');

    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: "Setup failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderServiceFields = () => {
    switch (serviceType) {
      case 'hospital':
        return (
          <>
            <div>
              <Label>Hospital Name *</Label>
              <Input
                value={formData.hospital_name || ''}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                placeholder="Enter hospital name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>General Beds</Label>
                <Input
                  type="number"
                  value={formData.general_beds || 0}
                  onChange={(e) => setFormData({ ...formData, general_beds: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>ICU Beds</Label>
                <Input
                  type="number"
                  value={formData.icu_beds || 0}
                  onChange={(e) => setFormData({ ...formData, icu_beds: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Cost Index</Label>
              <Select 
                value={formData.cost_index} 
                onValueChange={(value) => setFormData({ ...formData, cost_index: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'doctor':
      case 'pregnancy_care':
        return (
          <>
            <div>
              <Label>Specialization *</Label>
              <Input
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Gynecology, Pediatrics"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  value={formData.experience_years || 0}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Consultation Fee (₹)</Label>
                <Input
                  type="number"
                  value={formData.consultation_fee || 0}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </>
        );

      case 'mental_health':
        return (
          <>
            <div>
              <Label>Therapy Type *</Label>
              <Input
                value={formData.therapy_types || ''}
                onChange={(e) => setFormData({ ...formData, therapy_types: e.target.value })}
                placeholder="e.g., CBT, Counseling"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  value={formData.experience_years || 0}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Session Duration (min)</Label>
                <Input
                  type="number"
                  value={formData.session_duration || 60}
                  onChange={(e) => setFormData({ ...formData, session_duration: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Consultation Fee (₹)</Label>
              <Input
                type="number"
                value={formData.consultation_fee || 0}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseInt(e.target.value) })}
              />
            </div>
          </>
        );

      case 'fitness':
        return (
          <>
            <div>
              <Label>Gym/Studio Name</Label>
              <Input
                value={formData.gym_name || ''}
                onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })}
                placeholder="Enter gym or studio name"
              />
            </div>
            <div>
              <Label>Certifications</Label>
              <Input
                value={formData.certifications || ''}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="e.g., ACE, NASM"
              />
            </div>
            <div>
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={formData.experience_years || 0}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
              />
            </div>
          </>
        );

      case 'home_nursing':
        return (
          <>
            <div>
              <Label>Agency Name *</Label>
              <Input
                value={formData.agency_name || ''}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                placeholder="Enter agency name"
                required
              />
            </div>
            <div>
              <Label>Available Nurses</Label>
              <Input
                type="number"
                value={formData.available_nurses || 0}
                onChange={(e) => setFormData({ ...formData, available_nurses: parseInt(e.target.value) })}
              />
            </div>
          </>
        );

      case 'dietitian':
      case 'restaurant':
        return (
          <>
            <div>
              <Label>Restaurant/Business Name *</Label>
              <Input
                value={formData.restaurant_name || ''}
                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                placeholder="Enter business name"
                required
              />
            </div>
            <div>
              <Label>Cuisine Types</Label>
              <Input
                value={formData.cuisine_types || ''}
                onChange={(e) => setFormData({ ...formData, cuisine_types: e.target.value })}
                placeholder="e.g., Healthy, Vegan, Keto"
              />
            </div>
          </>
        );

      case 'insurance':
        return (
          <>
            <div>
              <Label>Company Name *</Label>
              <Input
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter insurance company name"
                required
              />
            </div>
            <div>
              <Label>License Number</Label>
              <Input
                value={formData.license_number || ''}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
          </>
        );

      case 'elder_expert':
        return (
          <>
            <div>
              <Label>Specialty *</Label>
              <Input
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Ayurveda, Traditional Medicine"
                required
              />
            </div>
            <div>
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={formData.experience_years || 0}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <MobileLayout showNavigation={false}>
      <MobileHeader 
        title="Complete Your Profile" 
        showBack={true}
      />
      
      <div className="px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>{serviceTypeLabels[serviceType] || 'Partner'} Setup</CardTitle>
            <CardDescription>
              Please provide your service details to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Address *</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  required
                />
              </div>

              {/* Service-Specific Fields */}
              {renderServiceFields()}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete Setup
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}