import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, Upload, FileText, Clock, CheckCircle, AlertCircle,
  MessageSquare, Phone, Mail, User, Calendar, Star, MapPin,
  CreditCard, Heart, Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const InsurancePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [insurancePartners, setInsurancePartners] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [claims, setClaims] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [claimForm, setClaimForm] = useState({
    claim_type: "",
    amount: "",
    description: "",
    date_of_incident: ""
  });

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    setUserInfo(user);
    loadData(user.id);

    // Real-time subscriptions
    const partnersChannel = supabase
      .channel('insurance-partners-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insurance_partners' }, () => {
        loadInsurancePartners();
      })
      .subscribe();

    const plansChannel = supabase
      .channel('insurance-plans-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insurance_plans' }, () => {
        loadInsurancePlans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(partnersChannel);
      supabase.removeChannel(plansChannel);
    };
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    await Promise.all([
      loadInsurancePartners(),
      loadInsurancePlans(),
      loadClaims(userId)
    ]);
    setLoading(false);
  };

  const loadInsurancePartners = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_partners')
        .select('*')
        .eq('is_active', true)
        .order('ratings', { ascending: false });

      if (error) throw error;
      setInsurancePartners(data || []);
    } catch (error) {
      console.error('Error loading insurance partners:', error);
    }
  };

  const loadInsurancePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*, insurance_partners(*)')
        .eq('is_active', true)
        .order('premium_monthly', { ascending: true });

      if (error) throw error;
      setInsurancePlans(data || []);
    } catch (error) {
      console.error('Error loading insurance plans:', error);
    }
  };

  const loadClaims = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('partner_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_type', 'insurance')
        .order('created_at', { ascending: false});

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    }
  };

  const subscribeToPlan = async (planId, partnerId) => {
    try {
      const { error } = await supabase
        .from('partner_bookings')
        .insert({
          user_id: userInfo.id,
          partner_id: partnerId,
          partner_type: 'insurance',
          booking_type: 'policy_subscription',
          status: 'pending',
          details: { plan_id: planId }
        });

      if (error) throw error;

      toast({
        title: "Subscription Requested!",
        description: "Insurance partner will contact you soon"
      });

      loadClaims(userInfo.id);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe",
        variant: "destructive"
      });
    }
  };

  const submitClaim = async () => {
    if (!claimForm.claim_type || !claimForm.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('partner_bookings')
        .insert({
          user_id: userInfo.id,
          partner_id: insurancePartners[0]?.id, // Default to first partner
          partner_type: 'insurance',
          booking_type: 'claim_request',
          status: 'pending',
          payment_amount: parseFloat(claimForm.amount),
          details: claimForm
        });

      if (error) throw error;

      toast({
        title: "Claim Submitted!",
        description: "Your claim is being processed"
      });

      setClaimForm({ claim_type: "", amount: "", description: "", date_of_incident: "" });
      loadClaims(userInfo.id);
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error",
        description: "Failed to submit claim",
        variant: "destructive"
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
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Insurance Support</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">
              <CreditCard className="mr-2 h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="claims">
              <FileText className="mr-2 h-4 w-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="documents">
              <Upload className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageSquare className="mr-2 h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Insurance Plans */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Insurance Plans</CardTitle>
                <CardDescription>
                  Compare and subscribe to health insurance plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : insurancePlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insurancePlans.map((plan) => (
                      <Card key={plan.id} className="hover:shadow-lg transition-shadow border-2">
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <h3 className="font-bold text-xl mb-2">{plan.plan_name}</h3>
                            <Badge variant="secondary" className="mb-3">
                              {plan.insurance_partners?.company_name}
                            </Badge>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Coverage</span>
                              <span className="font-semibold">₹{plan.coverage_amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Premium</span>
                              <span className="font-semibold">₹{plan.premium_monthly}/month</span>
                            </div>
                          </div>

                          {plan.coverage_details && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-sm mb-2">Coverage Includes:</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {Object.entries(plan.coverage_details).slice(0, 4).map(([key, value]) => (
                                  <li key={key} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    {String(value)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {plan.eligibility_criteria && (
                            <p className="text-xs text-muted-foreground mb-4">
                              {plan.eligibility_criteria}
                            </p>
                          )}

                          <Button 
                            className="w-full"
                            onClick={() => subscribeToPlan(plan.id, plan.partner_id)}
                            disabled={!plan.is_active}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Subscribe
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No insurance plans available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims */}
          <TabsContent value="claims" className="space-y-6">
            {/* Submit Claim */}
            <Card>
              <CardHeader>
                <CardTitle>Submit New Claim</CardTitle>
                <CardDescription>
                  File an insurance claim for medical expenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Claim Type *</Label>
                  <select
                    className="w-full p-2 border rounded-md mt-1"
                    value={claimForm.claim_type}
                    onChange={(e) => setClaimForm({ ...claimForm, claim_type: e.target.value })}
                  >
                    <option value="">Select claim type</option>
                    <option value="hospitalization">Hospitalization</option>
                    <option value="surgery">Surgery</option>
                    <option value="medicine">Medicine Purchase</option>
                    <option value="consultation">Doctor Consultation</option>
                    <option value="diagnostic">Diagnostic Tests</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <Label>Claim Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={claimForm.amount}
                    onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label>Date of Incident *</Label>
                  <Input
                    type="date"
                    value={claimForm.date_of_incident}
                    onChange={(e) => setClaimForm({ ...claimForm, date_of_incident: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={claimForm.description}
                    onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                    placeholder="Describe the medical event..."
                  />
                </div>

                <Button className="w-full" onClick={submitClaim}>
                  <FileText className="mr-2 h-4 w-4" />
                  Submit Claim
                </Button>
              </CardContent>
            </Card>

            {/* Claims History */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Tracking</CardTitle>
                <CardDescription>
                  View status of your submitted claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length > 0 ? (
                  <div className="space-y-3">
                    {claims.map((claim) => (
                      <Card key={claim.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">
                                  {claim.booking_type === 'claim_request' ? 'Claim' : 'Policy'} #{claim.id.slice(0, 8)}
                                </h4>
                                <Badge variant={
                                  claim.status === 'approved' ? 'default' :
                                  claim.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }>
                                  {claim.status}
                                </Badge>
                              </div>
                              
                              {claim.details && (
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Type: {claim.details.claim_type || claim.booking_type}</p>
                                  {claim.payment_amount && (
                                    <p>Amount: ₹{claim.payment_amount}</p>
                                  )}
                                  <p>Filed: {new Date(claim.created_at).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {claim.status === 'pending' ? (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              ) : claim.status === 'approved' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No claims submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Insurance Documents</CardTitle>
                <CardDescription>
                  Upload and manage your insurance documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Upload policy documents, medical bills, prescriptions
                  </p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insurancePartners.slice(0, 4).map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">{partner.company_name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Agent: {partner.agent_name}</span>
                      </div>
                      {partner.phone_number && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{partner.phone_number}</span>
                        </div>
                      )}
                      {partner.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{partner.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{partner.city}, {partner.state}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{partner.ratings || 0} rating</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat with Agent
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InsurancePage;