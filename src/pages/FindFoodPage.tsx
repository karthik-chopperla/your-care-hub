import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Utensils, Search, Star, MapPin, Clock, Leaf, Beef, Drumstick } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import { useToast } from "@/hooks/use-toast";

const FindFoodPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filters = [
    { id: "all", label: "All", icon: <Utensils className="h-3 w-3" /> },
    { id: "veg", label: "Veg", icon: <Leaf className="h-3 w-3" /> },
    { id: "protein", label: "Protein-rich", icon: <Beef className="h-3 w-3" /> },
    { id: "low-cal", label: "Low-calorie", icon: <Drumstick className="h-3 w-3" /> }
  ];

  const restaurants = [
    {
      id: 1,
      name: "Healthy Bites",
      distance: "1.2 km",
      rating: 4.5,
      cuisine: "Multi-cuisine",
      tags: ["Veg", "Protein-rich"],
      deliveryTime: "25-30 min"
    },
    {
      id: 2,
      name: "Fit Meals",
      distance: "2.5 km",
      rating: 4.7,
      cuisine: "Health Food",
      tags: ["Low-calorie", "Veg"],
      deliveryTime: "30-35 min"
    },
    {
      id: 3,
      name: "Green Plate",
      distance: "0.8 km",
      rating: 4.3,
      cuisine: "Salads & Bowls",
      tags: ["Veg", "Low-calorie"],
      deliveryTime: "20-25 min"
    }
  ];

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orderNow = (restaurantName: string) => {
    toast({
      title: "Order Placed!",
      description: `Your order from ${restaurantName} is being prepared.`,
      duration: 2000
    });
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="Find Food"
        showBack={true}
        showNotifications={false}
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search healthy food services"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap flex items-center gap-1 px-3 py-2"
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.icon}
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Restaurants */}
        {filteredRestaurants.length > 0 ? (
          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="mobile-card">
                <CardHeader>
                  <CardTitle className="text-base">{restaurant.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {restaurant.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" size="sm" onClick={() => orderNow(restaurant.name)}>
                    <Utensils className="mr-2 h-4 w-4" />
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No nearby results. Adjust your filters.</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default FindFoodPage;
