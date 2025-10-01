import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Hospital, Bed, DollarSign, Plus, Edit, Trash } from "lucide-react";

const HospitalDataPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone_number: "",
    email: "",
    general_beds: 0,
    icu_beds: 0,
    cost_index: "MEDIUM",
    emergency_services: false,
    ambulance_available: false,
    facilities: []
  });

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (user.role !== 'partner' || user.service_type !== 'hospital') {
      navigate('/partner-dashboard', { replace: true });
      return;
    }

    loadHospitals();
  }, [navigate]);

  const loadHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('hospitals')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Hospital Updated",
          description: "Hospital information has been updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('hospitals')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Hospital Added",
          description: "New hospital has been added successfully"
        });
      }

      resetForm();
      loadHospitals();
    } catch (error) {
      console.error('Error saving hospital:', error);
      toast({
        title: "Error",
        description: "Failed to save hospital data",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (hospital) => {
    setFormData(hospital);
    setEditingId(hospital.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;

    try {
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Hospital Deleted",
        description: "Hospital has been removed successfully"
      });

      loadHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast({
        title: "Error",
        description: "Failed to delete hospital",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone_number: "",
      email: "",
      general_beds: 0,
      icu_beds: 0,
      cost_index: "MEDIUM",
      emergency_services: false,
      ambulance_available: false,
      facilities: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const facilityOptions = [
    "ICU", "X-Ray", "CT Scan", "MRI", "Pharmacy", "Pathology",
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/partner-dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Hospital Data Management</h1>
                <p className="text-sm text-muted-foreground">Manage your hospital information</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hospital
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Hospital' : 'Add New Hospital'}</CardTitle>
              <CardDescription>Fill in the hospital details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_index">Cost Index</Label>
                    <Select
                      value={formData.cost_index}
                      onValueChange={(value) => setFormData({...formData, cost_index: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="general_beds">General Beds</Label>
                    <Input
                      id="general_beds"
                      type="number"
                      min="0"
                      value={formData.general_beds}
                      onChange={(e) => setFormData({...formData, general_beds: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icu_beds">ICU Beds</Label>
                    <Input
                      id="icu_beds"
                      type="number"
                      min="0"
                      value={formData.icu_beds}
                      onChange={(e) => setFormData({...formData, icu_beds: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Update Hospital' : 'Add Hospital'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Hospitals List */}
        <div className="grid gap-6">
          {hospitals.map((hospital) => (
            <Card key={hospital.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Hospital className="h-5 w-5 text-primary" />
                      {hospital.name}
                    </CardTitle>
                    <CardDescription>{hospital.address}, {hospital.city}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(hospital)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(hospital.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">General Beds</p>
                      <p className="font-semibold">{hospital.general_beds}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">ICU Beds</p>
                      <p className="font-semibold">{hospital.icu_beds}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost Index</p>
                    <Badge variant="secondary">{hospital.cost_index}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-semibold">{hospital.ratings || 0} ⭐</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HospitalDataPage;
