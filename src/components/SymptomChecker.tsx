import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, AlertTriangle, Check, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  triage_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommended_action: string;
  suggested_specialties: string[];
  home_remedies: string | null;
  explanation: string;
  disclaimer: string;
}

interface SymptomCheckerProps {
  onClose?: () => void;
}

export const SymptomChecker = ({ onClose }: SymptomCheckerProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const { toast } = useToast();

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
      console.log("Submitting symptoms:", symptoms);
      
      const { data, error } = await supabase.functions.invoke('symptom-checker', {
        body: { symptoms: symptoms.trim() }
      });

      console.log("Function response:", data, error);

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Assessment failed');
      }

      setAssessment(data.assessment);

      // Save to database - simplified without user_id requirement
      const { error: saveError } = await supabase
        .from('user_info')
        .insert([{
          full_name: 'Anonymous User',
          phone_number: '000-000-0000',
          country_code: '+1',
          password_hash: 'temp',
          role: 'user'
        }]);

      if (saveError) {
        console.error('Error saving assessment:', saveError);
        // Don't throw - still show the assessment even if save fails
      }

      toast({
        title: "Assessment Complete",
        description: "Your symptom assessment is ready",
      });

    } catch (error) {
      console.error('Error during assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Assessment Failed",
        description: errorMessage || "Unable to process your symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTriageColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-secondary text-secondary-foreground';
      case 'MEDIUM': return 'bg-primary text-primary-foreground';
      case 'HIGH': return 'bg-urgent text-urgent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTriageIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <Check className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      default: return <Stethoscope className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Symptom Checker</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Describe your symptoms and get an AI-powered health assessment. 
          This tool provides guidance but is not a replacement for professional medical care.
        </p>
      </div>

      <Card className="shadow-medium border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tell us about your symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium mb-2">
                Describe your symptoms in detail
              </label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="For example: I have been experiencing headaches for the past 3 days, along with slight fever and tiredness..."
                rows={6}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Include when symptoms started, severity, and any other relevant details
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={isLoading || !symptoms.trim()}
                className="flex-1"
                variant="hero"
              >
                {isLoading ? "Analyzing..." : "Analyze Symptoms"}
              </Button>
              {onClose && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {assessment && (
        <Card className="shadow-medium border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Triage Level */}
            <div className="space-y-2">
              <h3 className="font-semibold">Triage Level</h3>
              <Badge className={`${getTriageColor(assessment.triage_level)} flex items-center gap-2 w-fit`}>
                {getTriageIcon(assessment.triage_level)}
                {assessment.triage_level} PRIORITY
              </Badge>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <h3 className="font-semibold">Assessment</h3>
              <p className="text-foreground leading-relaxed">{assessment.explanation}</p>
            </div>

            {/* Recommended Action */}
            <div className="space-y-2">
              <h3 className="font-semibold">Recommended Action</h3>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {assessment.recommended_action}
                </AlertDescription>
              </Alert>
            </div>

            {/* Suggested Specialties */}
            {assessment.suggested_specialties && assessment.suggested_specialties.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Suggested Medical Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {assessment.suggested_specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Home Remedies */}
            {assessment.home_remedies && (
              <div className="space-y-2">
                <h3 className="font-semibold">Home Care Suggestions</h3>
                <Card className="bg-secondary/20 border-secondary/20">
                  <CardContent className="p-4">
                    <p className="text-sm">{assessment.home_remedies}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Disclaimer */}
            <Alert className="border-muted bg-muted/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {assessment.disclaimer}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="default" className="flex-1">
                Book Doctor Appointment
              </Button>
              <Button variant="wellness" className="flex-1">
                Consult Elder Expert
              </Button>
              <Button variant="outline" onClick={() => {
                setAssessment(null);
                setSymptoms("");
              }}>
                New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};