import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, Calendar, MessageSquare, Smile, Frown, Meh,
  TrendingUp, TrendingDown, Activity, Heart, Video,
  FileText, User, Clock, Plus, Star, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MentalHealthPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [currentMood, setCurrentMood] = useState(5);
  const [moodNote, setMoodNote] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const assessmentQuestions = [
    { id: 'sleep', question: 'How well have you been sleeping?', scale: 'Poor to Excellent' },
    { id: 'energy', question: 'How is your energy level?', scale: 'Very Low to Very High' },
    { id: 'concentration', question: 'How is your ability to concentrate?', scale: 'Very Poor to Excellent' },
    { id: 'appetite', question: 'How is your appetite?', scale: 'Very Poor to Excellent' },
    { id: 'social', question: 'How are your social interactions?', scale: 'Very Difficult to Easy' }
  ];

  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-600' },
    { value: 2, emoji: '😟', label: 'Sad', color: 'text-orange-600' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-600' },
    { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-600' },
    { value: 5, emoji: '😊', label: 'Very Good', color: 'text-blue-600' }
  ];

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
    const therapistsChannel = supabase
      .channel('mental-health-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mental_health_partners' }, () => {
        loadTherapists();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(therapistsChannel);
    };
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    await Promise.all([
      loadTherapists(),
      loadAppointments(userId),
      loadMoodEntries(userId)
    ]);
    setLoading(false);
  };

  const loadTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('mental_health_partners')
        .select('*')
        .eq('is_available', true)
        .order('ratings', { ascending: false });

      if (error) throw error;
      setTherapists(data || []);
    } catch (error) {
      console.error('Error loading therapists:', error);
    }
  };

  const loadAppointments = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('partner_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_type', 'mental_health')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadMoodEntries = async (userId) => {
    // In a real app, this would load from a mood_tracking table
    // For now, we'll use local state
    setMoodEntries([]);
  };

  const saveMoodEntry = () => {
    const entry = {
      date: new Date().toISOString(),
      mood: currentMood,
      note: moodNote,
      emoji: moodOptions.find(m => m.value === currentMood)?.emoji
    };
    
    setMoodEntries([entry, ...moodEntries]);
    toast({
      title: "Mood Saved",
      description: "Your mood has been recorded"
    });
    setMoodNote("");
  };

  const bookSession = async (therapistId) => {
    try {
      const { error } = await supabase
        .from('partner_bookings')
        .insert({
          user_id: userInfo.id,
          partner_id: therapistId,
          partner_type: 'mental_health',
          booking_type: 'therapy_session',
          status: 'pending',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Session Booked!",
        description: "Your therapy session has been scheduled"
      });

      loadAppointments(userInfo.id);
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive"
      });
    }
  };

  const handleAssessmentChange = (questionId, value) => {
    setAssessmentAnswers({
      ...assessmentAnswers,
      [questionId]: value
    });
  };

  const submitAssessment = () => {
    const totalScore = Object.values(assessmentAnswers).reduce((sum: number, val: unknown): number => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    const maxScore = assessmentQuestions.length * 10;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    let message = "";
    if (percentage >= 70) {
      message = "Your assessment shows positive mental health. Keep up the good self-care!";
    } else if (percentage >= 40) {
      message = "Your assessment shows some areas of concern. Consider booking a session with a therapist.";
    } else {
      message = "Your assessment indicates you may benefit from professional support. We recommend booking a session soon.";
    }

    toast({
      title: "Assessment Complete",
      description: message,
      duration: 5000
    });
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
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Mental Health Support</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="assessment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assessment">
              <FileText className="mr-2 h-4 w-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="mood">
              <Activity className="mr-2 h-4 w-4" />
              Mood Tracker
            </TabsTrigger>
            <TabsTrigger value="therapists">
              <User className="mr-2 h-4 w-4" />
              Therapists
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="mr-2 h-4 w-4" />
              My Sessions
            </TabsTrigger>
          </TabsList>

          {/* Self-Assessment */}
          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Self-Assessment</CardTitle>
                <CardDescription>
                  Take a moment to reflect on your recent mental health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {assessmentQuestions.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{q.question}</h4>
                      <Badge variant="outline">{assessmentAnswers[q.id] || 0}/10</Badge>
                    </div>
                    <Slider
                      value={[assessmentAnswers[q.id] || 0]}
                      onValueChange={(value) => handleAssessmentChange(q.id, value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{q.scale.split(' to ')[0]}</span>
                      <span>{q.scale.split(' to ')[1]}</span>
                    </div>
                  </div>
                ))}
                
                <Button 
                  className="w-full" 
                  onClick={submitAssessment}
                  disabled={Object.keys(assessmentAnswers).length !== assessmentQuestions.length}
                >
                  Submit Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Crisis Hotline</h4>
                      <p className="text-sm text-muted-foreground mb-2">24/7 Emergency Support</p>
                      <Button variant="destructive" size="sm">Call Now</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Meditation Guide</h4>
                      <p className="text-sm text-muted-foreground mb-2">Stress reduction techniques</p>
                      <Button variant="outline" size="sm">View Guide</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Breathing Exercises</h4>
                      <p className="text-sm text-muted-foreground mb-2">Calm your mind</p>
                      <Button variant="outline" size="sm">Start Exercise</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Sleep Tips</h4>
                      <p className="text-sm text-muted-foreground mb-2">Improve sleep quality</p>
                      <Button variant="outline" size="sm">Read Tips</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mood Tracker */}
          <TabsContent value="mood" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Mood Tracking</CardTitle>
                <CardDescription>
                  Track your mood to identify patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <h4 className="font-medium mb-4">How are you feeling today?</h4>
                  <div className="grid grid-cols-5 gap-4">
                    {moodOptions.map((mood) => (
                      <Card
                        key={mood.value}
                        className={`cursor-pointer transition-all ${
                          currentMood === mood.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => setCurrentMood(mood.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`text-4xl mb-2 ${mood.color}`}>{mood.emoji}</div>
                          <p className="text-sm font-medium">{mood.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Mood Note */}
                <div>
                  <h4 className="font-medium mb-2">Add a note (optional)</h4>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                    placeholder="What's on your mind?"
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={saveMoodEntry}>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Mood Entry
                </Button>

                {/* Mood History */}
                {moodEntries.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Entries</h4>
                    <div className="space-y-3">
                      {moodEntries.slice(0, 7).map((entry, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{entry.emoji}</span>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(entry.date).toLocaleDateString()}
                                </p>
                                {entry.note && (
                                  <p className="text-sm mt-1">{entry.note}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Therapists */}
          <TabsContent value="therapists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
                <CardDescription>
                  Connect with licensed therapists and counselors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : therapists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {therapists.map((therapist) => (
                      <Card key={therapist.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{therapist.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {therapist.specialization?.join(', ')}
                              </p>
                            </div>
                            <Badge variant={therapist.is_available ? "default" : "secondary"}>
                              {therapist.is_available ? 'Available' : 'Busy'}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{therapist.session_duration} min sessions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{therapist.ratings || 0} ({therapist.total_ratings || 0} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{therapist.city}, {therapist.state}</span>
                            </div>
                          </div>

                          {therapist.therapy_types && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {therapist.therapy_types.slice(0, 3).map((type, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <p className="text-lg font-semibold mb-3">₹{therapist.consultation_fee}</p>

                          <Button 
                            className="w-full"
                            onClick={() => bookSession(therapist.id)}
                            disabled={!therapist.is_available}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Book Session
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No therapists available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Sessions */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Therapy Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <Card key={apt.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold mb-1">Therapy Session</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(apt.scheduled_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                              {apt.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sessions booked yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => {
                        const tab = document.querySelector('[value="therapists"]') as HTMLElement;
                        tab?.click();
                      }}
                    >
                      Book Your First Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MentalHealthPage;