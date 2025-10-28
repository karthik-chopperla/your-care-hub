import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, CheckCircle, Circle, Clock, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";

const FitnessRecoveryPage = () => {
  const [exercises, setExercises] = useState([
    { id: 1, name: "Leg Stretches", duration: "10 min", status: "pending", description: "Gentle stretching for recovery" },
    { id: 2, name: "Arm Circles", duration: "5 min", status: "pending", description: "Shoulder mobility exercise" },
    { id: 3, name: "Walking", duration: "20 min", status: "pending", description: "Low-impact cardio" },
    { id: 4, name: "Core Breathing", duration: "8 min", status: "pending", description: "Deep breathing with core engagement" }
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleStatus = (id: number) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, status: ex.status === "completed" ? "pending" : "completed" } : ex
    ));
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise?.status === "pending") {
      toast({ title: "Exercise completed!", description: `${exercise.name} marked as done.`, duration: 2000 });
    }
  };

  const completedCount = exercises.filter(ex => ex.status === "completed").length;

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="Fitness Recovery"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        {/* Progress Summary */}
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
                <p className="text-2xl font-bold text-primary">{completedCount}/{exercises.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        {exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="mobile-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(exercise.id)}
                      className="mt-1 shrink-0"
                    >
                      {exercise.status === "completed" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${exercise.status === "completed" ? 'line-through text-muted-foreground' : ''}`}>
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {exercise.duration}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No recovery program yet.</p>
          </div>
        )}

        <Button className="w-full" onClick={() => toast({ title: "Trainer contacted!", description: "Your trainer will create a program soon." })}>
          <Dumbbell className="mr-2 h-4 w-4" />
          Request Custom Program
        </Button>
      </div>
    </MobileLayout>
  );
};

export default FitnessRecoveryPage;
