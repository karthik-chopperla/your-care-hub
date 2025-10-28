import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Activity, TrendingDown, TrendingUp, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";

const DietPlansPage = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const goals = [
    { id: "weight-loss", label: "Weight Loss", icon: <TrendingDown className="h-5 w-5" />, color: "bg-red-500/10 text-red-600" },
    { id: "weight-gain", label: "Weight Gain", icon: <TrendingUp className="h-5 w-5" />, color: "bg-green-500/10 text-green-600" },
    { id: "maintenance", label: "Maintenance", icon: <Activity className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-600" }
  ];

  const mealPlan = {
    breakfast: { name: "Oatmeal with Berries", calories: 350, protein: "12g", carbs: "58g", fat: "8g" },
    midMorning: { name: "Greek Yogurt & Almonds", calories: 200, protein: "15g", carbs: "12g", fat: "10g" },
    lunch: { name: "Grilled Chicken Salad", calories: 450, protein: "35g", carbs: "30g", fat: "18g" },
    evening: { name: "Fruit Smoothie", calories: 180, protein: "6g", carbs: "32g", fat: "3g" },
    dinner: { name: "Baked Salmon with Veggies", calories: 500, protein: "40g", carbs: "35g", fat: "20g" }
  };

  const totalNutrition = {
    calories: 1680,
    protein: "108g",
    carbs: "167g",
    fat: "59g"
  };

  const selectGoal = (goalId: string) => {
    setSelectedGoal(goalId);
    toast({
      title: "Goal Selected",
      description: `Your ${goals.find(g => g.id === goalId)?.label} plan is ready!`,
      duration: 2000
    });
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="Diet Plans"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        {/* Goal Selection */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="text-base">Select Your Goal</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => selectGoal(goal.id)}
                className={`mobile-card p-3 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${selectedGoal === goal.id ? 'border-2 border-primary' : ''}`}
              >
                <div className={`mb-2 p-2 rounded-lg ${goal.color}`}>
                  {goal.icon}
                </div>
                <p className="text-xs font-medium text-center">{goal.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedGoal ? (
          <>
            <Tabs defaultValue="meals" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="meals">Meals</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              </TabsList>

              <TabsContent value="meals" className="space-y-3 mt-4">
                {Object.entries(mealPlan).map(([key, meal]) => (
                  <Card key={key} className="mobile-card">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-semibold">{meal.name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{meal.calories} cal</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="nutrition" className="mt-4">
                <Card className="mobile-card">
                  <CardHeader>
                    <CardTitle className="text-base">Daily Nutritional Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-primary/5 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{totalNutrition.calories}</p>
                      <p className="text-xs text-muted-foreground">Total Calories</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 border rounded-lg text-center">
                        <p className="font-bold text-blue-600">{totalNutrition.protein}</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-2 border rounded-lg text-center">
                        <p className="font-bold text-green-600">{totalNutrition.carbs}</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-2 border rounded-lg text-center">
                        <p className="font-bold text-yellow-600">{totalNutrition.fat}</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button className="w-full" onClick={() => toast({ title: "Plan Subscribed!", description: "Your dietician will contact you soon." })}>
              <Apple className="mr-2 h-4 w-4" />
              Subscribe to Plan
            </Button>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No plan assigned yet. Select a goal to begin.</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default DietPlansPage;
