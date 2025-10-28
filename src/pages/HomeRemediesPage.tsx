import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Leaf, Clock, AlertCircle, BookmarkPlus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";

const HomeRemediesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [savedRemedies, setSavedRemedies] = useState<number[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const remedies = [
    {
      id: 1,
      condition: "Common Cold",
      ingredients: ["Ginger", "Honey", "Warm water"],
      steps: ["Grate fresh ginger", "Mix 1 tsp with 1 tbsp honey", "Add to warm water", "Drink 2-3 times daily"],
      duration: "3-5 days",
      safety: "Safe for adults. Consult doctor if pregnant or diabetic."
    },
    {
      id: 2,
      condition: "Headache",
      ingredients: ["Peppermint oil", "Lavender oil", "Carrier oil"],
      steps: ["Mix 2 drops each essential oil", "Dilute with carrier oil", "Massage temples gently"],
      duration: "Relief in 15-20 minutes",
      safety: "Avoid if allergic to essential oils."
    },
    {
      id: 3,
      condition: "Sore Throat",
      ingredients: ["Salt", "Warm water", "Turmeric powder"],
      steps: ["Mix 1 tsp salt in warm water", "Add pinch of turmeric", "Gargle 3 times daily"],
      duration: "2-3 days",
      safety: "Safe for all ages above 6 years."
    },
    {
      id: 4,
      condition: "Indigestion",
      ingredients: ["Cumin seeds", "Fennel seeds", "Water"],
      steps: ["Boil 1 tsp each seed in water", "Strain after 10 minutes", "Drink warm"],
      duration: "Relief within 1 hour",
      safety: "Safe for adults and children above 5 years."
    },
    {
      id: 5,
      condition: "Minor Burns",
      ingredients: ["Aloe vera gel", "Cool water"],
      steps: ["Cool burn under water for 10 min", "Pat dry gently", "Apply aloe vera gel"],
      duration: "Healing in 3-5 days",
      safety: "For minor burns only. Seek medical help for severe burns."
    }
  ];

  const filteredRemedies = remedies.filter(remedy =>
    remedy.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSave = (id: number) => {
    if (savedRemedies.includes(id)) {
      setSavedRemedies(savedRemedies.filter(r => r !== id));
      toast({ title: "Removed from saved", duration: 2000 });
    } else {
      setSavedRemedies([...savedRemedies, id]);
      toast({ title: "Saved to your remedies", duration: 2000 });
    }
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="Home Remedies"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter symptom or condition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Empty State */}
        {filteredRemedies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No remedies found. Try different keywords.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRemedies.map((remedy) => (
              <Card key={remedy.id} className="mobile-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        {remedy.condition}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSave(remedy.id)}
                    >
                      <BookmarkPlus className={`h-5 w-5 ${savedRemedies.includes(remedy.id) ? 'fill-current text-primary' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Ingredients */}
                  <div>
                    <p className="text-sm font-semibold mb-1">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {remedy.ingredients.map((ing, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Collapsible Steps */}
                  {expandedId === remedy.id ? (
                    <>
                      <div>
                        <p className="text-sm font-semibold mb-1">Steps:</p>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                          {remedy.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className="text-sm font-semibold flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          Duration: {remedy.duration}
                        </p>
                      </div>

                      <div className="p-2 bg-yellow-500/10 rounded-md">
                        <p className="text-xs flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5 shrink-0" />
                          <span className="text-yellow-800 dark:text-yellow-600">{remedy.safety}</span>
                        </p>
                      </div>
                    </>
                  ) : null}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpandedId(expandedId === remedy.id ? null : remedy.id)}
                  >
                    {expandedId === remedy.id ? (
                      <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Show More <ChevronDown className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default HomeRemediesPage;
