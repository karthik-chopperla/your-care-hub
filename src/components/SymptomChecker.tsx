import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Stethoscope, AlertTriangle, Check, Clock, User, Mic, Save, History, ChevronDown, Hospital, Home, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Assessment {
  triage_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommended_action: string;
  suggested_specialties: string[];
  home_remedies: string | null;
  explanation: string;
  disclaimer: string;
}

interface HistoryItem {
  id: string;
  symptoms: string;
  assessment: Assessment;
  created_at: string;
}

interface SymptomCheckerProps {
  onClose?: () => void;
}

export const SymptomChecker = ({ onClose }: SymptomCheckerProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [saveToRecords, setSaveToRecords] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('symptom_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) {
        setHistory(data.map(item => ({
          ...item,
          assessment: item.assessment as unknown as Assessment
        })));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice input failed",
        description: "Could not capture voice input. Please try again.",
        variant: "destructive",
      });
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "Enter your symptoms to get an AI assessment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('symptom-checker', {
        body: { symptoms: symptoms.trim() }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Assessment failed');

      setAssessment(data.assessment);

      // Save to history if user is logged in and toggle is on
      if (saveToRecords) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: saveError } = await supabase
            .from('symptom_history')
            .insert({
              user_id: user.id,
              symptoms: symptoms.trim(),
              assessment: data.assessment
            });

          if (saveError) {
            console.error('Error saving to history:', saveError);
          } else {
            await loadHistory();
            toast({
              title: "Saved to My Records",
              description: "Assessment saved successfully",
            });
          }
        }
      }

      toast({
        title: "Assessment Complete",
        description: "Your symptom assessment is ready",
      });

    } catch (error) {
      console.error('Error during assessment:', error);
      setAssessment(null);
      toast({
        title: "Assessment Failed",
        description: "Sorry, we couldn't analyze this symptom. Please try again or consult a doctor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAgain = () => {
    setAssessment(null);
    setSymptoms("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('symptom_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadHistory();
      toast({
        title: "Deleted",
        description: "History item removed",
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        title: "Error",
        description: "Could not delete history item",
        variant: "destructive",
      });
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setSymptoms(item.symptoms);
    setAssessment(item.assessment);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityWidth = (level: string) => {
    switch (level) {
      case 'LOW': return 'w-1/3';
      case 'MEDIUM': return 'w-2/3';
      case 'HIGH': return 'w-full';
      default: return 'w-1/2';
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen w-full px-4 py-6 space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            My Symptom History
          </h2>
          <Button variant="outline" onClick={() => setShowHistory(false)}>
            Back
          </Button>
        </div>

        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No symptom checks saved yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1" onClick={() => loadHistoryItem(item)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(item.assessment.triage_level)}>
                        {item.assessment.triage_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()} at{' '}
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{item.symptoms}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Symptom Checker</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Describe your symptoms for instant AI-powered health insights
        </p>
      </div>

      {/* Input Area - Only show if no assessment */}
      {!assessment && (
        <Card className="shadow-lg border-2 animate-in slide-in-from-bottom duration-500">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms here..."
                  rows={6}
                  className="w-full resize-none text-base pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2"
                  onClick={handleVoiceInput}
                  disabled={isListening}
                >
                  <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span className="text-sm font-medium">Save to My Records</span>
                </div>
                <Switch checked={saveToRecords} onCheckedChange={setSaveToRecords} />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isLoading || !symptoms.trim()}
                  className="flex-1 h-12 text-base"
                  variant="default"
                >
                  {isLoading ? "Analyzing..." : "Analyze Symptoms"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  className="h-12"
                >
                  <History className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Results Area */}
      {assessment && (
        <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
          {/* Severity Indicator */}
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Severity Level</h3>
                <Badge className={`${getSeverityColor(assessment.triage_level)} text-white`}>
                  {assessment.triage_level} PRIORITY
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${getSeverityColor(assessment.triage_level)} ${getSeverityWidth(assessment.triage_level)} transition-all duration-1000 ease-out`}
                />
              </div>
            </div>
          </Card>

          {/* Primary Health Insight */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Health Insight
                  </CardTitle>
                  <ChevronDown className="h-5 w-5" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <p className="leading-relaxed">{assessment.explanation}</p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Recommended Action */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recommended Action
                  </CardTitle>
                  <ChevronDown className="h-5 w-5" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Alert>
                    <AlertDescription className="font-medium">
                      {assessment.recommended_action}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Suggested Specialties */}
          {assessment.suggested_specialties?.length > 0 && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Suggested Specialists
                    </CardTitle>
                    <ChevronDown className="h-5 w-5" />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {assessment.suggested_specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Home Remedies */}
          {assessment.home_remedies && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Home Care Suggestions
                    </CardTitle>
                    <ChevronDown className="h-5 w-5" />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{assessment.home_remedies}</p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Helpful Links */}
          <Card className="p-6 bg-primary/5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="default" 
                className="w-full justify-start gap-2 h-12"
                onClick={() => navigate('/doctors')}
              >
                <Calendar className="h-5 w-5" />
                Book Doctor Appointment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-12"
                onClick={() => navigate('/hospital-search')}
              >
                <Hospital className="h-5 w-5" />
                Find Nearby Hospitals
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-12"
                onClick={() => navigate('/home-remedies')}
              >
                <Home className="h-5 w-5" />
                Explore Home Remedies
              </Button>
            </div>
          </Card>

          {/* Check Again Button */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={handleCheckAgain}
            >
              Check Again
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHistory(true)}
              className="h-12"
            >
              <History className="h-5 w-5" />
            </Button>
          </div>

          {/* Disclaimer */}
          <Alert className="border-muted bg-muted/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {assessment.disclaimer}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};