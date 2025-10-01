import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Baby, Calendar, BookOpen, Heart, Phone, Video, 
  Scale, Activity, Apple, Pill, User, Clock, Plus,
  MessageSquare, FileText, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PregnancyCarePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [gynecologists, setGynecologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    due_date: "",
    current_week: 1,
    blood_group: "",
    height: "",
    pre_pregnancy_weight: "",
    current_weight: "",
    complications: ""
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
    const gynChannel = supabase
      .channel('gynecologists-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gynecologists' }, () => {
        loadGynecologists();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gynChannel);
    };
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    await Promise.all([
      loadGynecologists(),
      loadAppointments(userId)
    ]);
    setLoading(false);
  };

  const loadGynecologists = async () => {
    try {
      const { data, error } = await supabase
        .from('gynecologists')
        .select('*')
        .eq('is_available', true)
        .order('ratings', { ascending: false });

      if (error) throw error;
      setGynecologists(data || []);
    } catch (error) {
      console.error('Error loading gynecologists:', error);
    }
  };

  const loadAppointments = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('partner_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_type', 'gynecologist')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const bookAppointment = async (gynecologistId) => {
    try {
      const { error } = await supabase
        .from('partner_bookings')
        .insert({
          user_id: userInfo.id,
          partner_id: gynecologistId,
          partner_type: 'gynecologist',
          booking_type: 'pregnancy_consultation',
          status: 'pending',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked!",
        description: "Your pregnancy care appointment has been scheduled"
      });

      loadAppointments(userInfo.id);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    }
  };

  const weeklyTips = [
    { week: 1, title: "Conception", tip: "Start taking prenatal vitamins with folic acid" },
    { week: 8, title: "Embryo Development", tip: "Morning sickness may begin. Stay hydrated" },
    { week: 12, title: "End of First Trimester", tip: "Risk of miscarriage decreases significantly" },
    { week: 20, title: "Halfway There!", tip: "You may feel baby's movements (quickening)" },
    { week: 28, title: "Third Trimester", tip: "Baby's eyes can now open and close" },
    { week: 36, title: "Almost There", tip: "Baby is gaining about 1 ounce per day" },
    { week: 40, title: "Due Date", tip: "Get ready to meet your baby!" }
  ];

  const nutritionTips = [
    { icon: <Apple className="h-5 w-5" />, title: "Fruits & Vegetables", description: "5-7 servings daily for vitamins and fiber" },
    { icon: <Pill className="h-5 w-5" />, title: "Prenatal Vitamins", description: "Daily supplements with folic acid and iron" },
    { icon: <Activity className="h-5 w-5" />, title: "Protein", description: "Lean meats, eggs, beans for baby's growth" },
    { icon: <Scale className="h-5 w-5" />, title: "Healthy Weight Gain", description: "25-35 lbs recommended for healthy BMI" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/user-dashboard')}>
              ← Back
            </Button>
            <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Pregnancy Care</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracker">
              <Calendar className="mr-2 h-4 w-4" />
              Tracker
            </TabsTrigger>
            <TabsTrigger value="consultations">
              <Video className="mr-2 h-4 w-4" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="nutrition">
              <Apple className="mr-2 h-4 w-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="tips">
              <BookOpen className="mr-2 h-4 w-4" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Weekly Progress Tracker */}
          <TabsContent value="tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600" />
                  Weekly Progress Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Week Display */}
                  <div className="p-6 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg border-2 border-pink-300/50">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-pink-600 mb-2">Week {profileForm.current_week || 1}</h2>
                      <p className="text-muted-foreground">of your pregnancy journey</p>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeklyTips.map((tip) => (
                      <Card key={tip.week} className={`${profileForm.current_week >= tip.week ? 'border-pink-500 bg-pink-500/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${profileForm.current_week >= tip.week ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              <span className="text-sm font-bold">{tip.week}</span>
                            </div>
                            <h3 className="font-semibold">{tip.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{tip.tip}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Update Week */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Label>Current Week:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="42"
                          value={profileForm.current_week}
                          onChange={(e) => setProfileForm({ ...profileForm, current_week: parseInt(e.target.value) })}
                          className="w-24"
                        />
                        <Button onClick={() => toast({ title: "Week Updated", description: "Your pregnancy week has been updated" })}>
                          Update Week
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultations */}
          <TabsContent value="consultations" className="space-y-6">
            {/* Available Gynecologists */}
            <Card>
              <CardHeader>
                <CardTitle>Book Gynecologist Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : gynecologists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gynecologists.map((gyn) => (
                      <Card key={gyn.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{gyn.name}</h3>
                              <p className="text-sm text-muted-foreground">{gyn.specialization?.join(', ')}</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                {gyn.experience_years} years experience
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">₹{gyn.consultation_fee}</Badge>
                                <Badge variant={gyn.is_available ? "default" : "secondary"}>
                                  {gyn.is_available ? 'Available' : 'Unavailable'}
                                </Badge>
                              </div>
                            </div>
                            <Button onClick={() => bookAppointment(gyn.id)} disabled={!gyn.is_available}>
                              Book
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No gynecologists available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">Pregnancy Consultation</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(apt.scheduled_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No appointments scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Guide */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pregnancy Nutrition Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nutritionTips.map((tip, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600">
                            {tip.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{tip.title}</h3>
                            <p className="text-sm text-muted-foreground">{tip.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Diet Plan Suggestions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Meal Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-2">Breakfast</h4>
                        <p className="text-sm text-muted-foreground">Oatmeal with berries, Greek yogurt, whole grain toast</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Mid-Morning Snack</h4>
                        <p className="text-sm text-muted-foreground">Fresh fruit, handful of nuts</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Lunch</h4>
                        <p className="text-sm text-muted-foreground">Grilled chicken salad, quinoa, steamed vegetables</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Evening Snack</h4>
                        <p className="text-sm text-muted-foreground">Carrot sticks with hummus</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Dinner</h4>
                        <p className="text-sm text-muted-foreground">Baked fish, brown rice, leafy greens</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tips */}
          <TabsContent value="tips" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-pink-600" />
                    Exercise Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Walking: 30 minutes daily</p>
                  <p>• Prenatal yoga for flexibility</p>
                  <p>• Swimming (low impact)</p>
                  <p>• Pelvic floor exercises</p>
                  <p>• Avoid contact sports</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-pink-600" />
                    Warning Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Severe abdominal pain</p>
                  <p>• Heavy bleeding</p>
                  <p>• Severe headaches</p>
                  <p>• Vision changes</p>
                  <p>• Decreased fetal movement</p>
                  <Button variant="destructive" size="sm" className="mt-3" onClick={() => navigate('/sos')}>
                    Emergency SOS
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    Self-Care
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Get adequate rest (7-9 hours)</p>
                  <p>• Stay hydrated (8-10 glasses)</p>
                  <p>• Practice relaxation techniques</p>
                  <p>• Prenatal massage</p>
                  <p>• Connect with support groups</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-pink-600" />
                    Preparation Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>✓ Hospital bag packed</p>
                  <p>✓ Pediatrician selected</p>
                  <p>✓ Birth plan discussed</p>
                  <p>✓ Nursery prepared</p>
                  <p>✓ Maternity leave arranged</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PregnancyCarePage;