import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Leaf, Clock, AlertCircle, BookmarkPlus, UserCircle, MessageSquare, Star, Send } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const HomeRemediesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [remedies, setRemedies] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [savedRemedies, setSavedRemedies] = useState<string[]>([]);
  const [myAdvice, setMyAdvice] = useState<any[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRemedies();
      loadExperts();
      loadSavedRemedies();
      loadMyAdvice();
    }
  }, [user, searchTerm]);

  const loadRemedies = async () => {
    const query = supabase
      .from('elder_remedies')
      .select('*, elder_experts(name, specialty)')
      .eq('is_verified', true);
    
    if (searchTerm) {
      query.ilike('condition', `%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error loading remedies:', error);
    } else {
      setRemedies(data || []);
    }
  };

  const loadExperts = async () => {
    const { data, error } = await supabase
      .from('elder_experts')
      .select('*')
      .eq('verification_status', 'verified')
      .order('ratings', { ascending: false });
    
    if (error) {
      console.error('Error loading experts:', error);
    } else {
      setExperts(data || []);
    }
  };

  const loadSavedRemedies = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('elder_saved_remedies')
      .select('remedy_id')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error loading saved remedies:', error);
    } else {
      setSavedRemedies(data?.map(r => r.remedy_id).filter(Boolean) || []);
    }
  };

  const loadMyAdvice = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('elder_advice_requests')
      .select('*, elder_experts(name, specialty)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading advice:', error);
    } else {
      setMyAdvice(data || []);
    }
  };

  const toggleSaveRemedy = async (remedyId: string) => {
    if (!user) return;
    
    if (savedRemedies.includes(remedyId)) {
      const { error } = await supabase
        .from('elder_saved_remedies')
        .delete()
        .eq('user_id', user.id)
        .eq('remedy_id', remedyId);
      
      if (error) {
        toast({ title: "Error removing remedy", variant: "destructive" });
      } else {
        setSavedRemedies(savedRemedies.filter(id => id !== remedyId));
        toast({ title: "Removed from saved remedies" });
      }
    } else {
      const { error } = await supabase
        .from('elder_saved_remedies')
        .insert({ user_id: user.id, remedy_id: remedyId });
      
      if (error) {
        toast({ title: "Error saving remedy", variant: "destructive" });
      } else {
        setSavedRemedies([...savedRemedies, remedyId]);
        toast({ title: "Saved to your remedies" });
      }
    }
  };

  const submitQuestion = async () => {
    if (!user || !selectedExpert || !question.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await supabase
      .from('elder_advice_requests')
      .insert({
        user_id: user.id,
        elder_id: selectedExpert.id,
        question: question.trim(),
        status: 'pending'
      });
    
    if (error) {
      toast({ title: "Error sending question", variant: "destructive" });
    } else {
      toast({ title: "Question sent successfully!" });
      setQuestion("");
      setSelectedExpert(null);
      loadMyAdvice();
    }
    setIsSubmitting(false);
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="Elder/Expert Remedies"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        <Tabs defaultValue="remedies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="remedies">Remedies</TabsTrigger>
            <TabsTrigger value="experts">Experts</TabsTrigger>
            <TabsTrigger value="myadvice">My Advice</TabsTrigger>
          </TabsList>

          {/* Remedies Tab */}
          <TabsContent value="remedies" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask about your symptom or issue (e.g., cold, headache, acidity)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {remedies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  {searchTerm ? "No remedies found. Try different keywords." : "Search for symptoms to see expert remedies."}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  {remedies.map((remedy) => (
                    <Card key={remedy.id} className="mobile-card">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Leaf className="h-4 w-4 text-green-600" />
                              {remedy.remedy_name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              By {remedy.elder_experts?.name} • {remedy.elder_experts?.specialty}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveRemedy(remedy.id)}
                          >
                            <BookmarkPlus 
                              className={`h-5 w-5 ${savedRemedies.includes(remedy.id) ? 'fill-current text-primary' : ''}`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Badge variant="outline" className="text-xs">{remedy.condition}</Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm font-semibold mb-1">Ingredients:</p>
                          <div className="flex flex-wrap gap-1">
                            {remedy.ingredients.map((ing: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold mb-1">Preparation:</p>
                          <p className="text-sm text-muted-foreground">{remedy.preparation_steps}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3" />
                          <span className="font-semibold">Duration:</span>
                          <span className="text-muted-foreground">{remedy.duration}</span>
                        </div>

                        {remedy.safety_notes && (
                          <div className="p-2 bg-yellow-500/10 rounded-md">
                            <p className="text-xs flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5 shrink-0" />
                              <span className="text-yellow-800 dark:text-yellow-600">{remedy.safety_notes}</span>
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts" className="space-y-4">
            {experts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No verified experts available yet.</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  {experts.map((expert) => (
                    <Card key={expert.id} className="mobile-card">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <UserCircle className="h-10 w-10 text-primary" />
                            <div>
                              <h4 className="font-semibold">{expert.name}</h4>
                              <p className="text-xs text-muted-foreground">{expert.specialty}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs">{expert.ratings || 0} rating</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={expert.is_available ? "default" : "secondary"} className="text-xs">
                            {expert.is_available ? "Online" : "Offline"}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {expert.experience_years} years experience
                          {expert.traditional_medicine_type && ` • ${expert.traditional_medicine_type}`}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSearchTerm(expert.specialty);
                            }}
                          >
                            View Remedies
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedExpert(expert)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Ask Advice
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* My Advice Tab */}
          <TabsContent value="myadvice" className="space-y-4">
            {myAdvice.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No advice requests yet. Ask an expert!</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  {myAdvice.map((advice) => (
                    <Card key={advice.id} className="mobile-card">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-sm">To: {advice.elder_experts?.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{advice.elder_experts?.specialty}</p>
                          </div>
                          <Badge variant={advice.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                            {advice.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold mb-1">Your Question:</p>
                          <p className="text-sm text-muted-foreground">{advice.question}</p>
                        </div>
                        
                        {advice.reply && (
                          <div className="p-3 bg-primary/5 rounded-md">
                            <p className="text-xs font-semibold mb-1">Expert Reply:</p>
                            <p className="text-sm">{advice.reply}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(advice.replied_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Asked on {new Date(advice.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ask Advice Dialog */}
      {selectedExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setSelectedExpert(null)}>
          <div className="bg-background rounded-t-2xl w-full p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ask {selectedExpert.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedExpert(null)}>
                Close
              </Button>
            </div>
            
            <Textarea
              placeholder="Describe your symptoms or question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
            />
            
            <Button 
              className="w-full" 
              onClick={submitQuestion}
              disabled={isSubmitting || !question.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Question
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default HomeRemediesPage;
