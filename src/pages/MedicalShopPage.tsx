import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pill, Search, ShoppingCart, Grid, List, Star, MapPin, 
  Phone, Clock, Plus, Minus, Trash2, Heart, Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MedicalShopPage = () => {
  const [shops, setShops] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedShop, setSelectedShop] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    const shopsChannel = supabase
      .channel('medical-shops-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_shops' }, () => {
        loadShops();
      })
      .subscribe();

    const inventoryChannel = supabase
      .channel('medicine-inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medicine_inventory' }, () => {
        if (selectedShop) loadMedicines(selectedShop.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(shopsChannel);
      supabase.removeChannel(inventoryChannel);
    };
  }, [navigate, selectedShop]);

  const loadData = async (userId) => {
    setLoading(true);
    await Promise.all([loadShops(), loadOrderHistory(userId)]);
    setLoading(false);
  };

  const loadShops = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_shops')
        .select('*')
        .eq('is_open', true)
        .order('ratings', { ascending: false });

      if (error) throw error;
      setShops(data || []);
      
      if (data && data.length > 0 && !selectedShop) {
        setSelectedShop(data[0]);
        loadMedicines(data[0].id);
      }
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };

  const loadMedicines = async (shopId) => {
    try {
      const { data, error } = await supabase
        .from('medicine_inventory')
        .select('*')
        .eq('shop_id', shopId)
        .gt('stock_quantity', 0)
        .order('medicine_name');

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const loadOrderHistory = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('partner_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_type', 'medical_shop')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrderHistory(data || []);
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  };

  const addToCart = (medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    toast({
      title: "Added to Cart",
      description: `${medicine.medicine_name} added`,
      duration: 2000
    });
  };

  const updateQuantity = (medicineId, delta) => {
    setCart(cart.map(item => {
      if (item.id === medicineId) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: Math.max(0, newQuantity) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const { error } = await supabase
        .from('partner_bookings')
        .insert({
          user_id: userInfo.id,
          partner_id: selectedShop.id,
          partner_type: 'medical_shop',
          booking_type: 'medicine_order',
          status: 'pending',
          payment_amount: totalAmount,
          details: {
            items: cart.map(item => ({
              medicine_name: item.medicine_name,
              quantity: item.quantity,
              price: item.price
            })),
            shop_name: selectedShop.shop_name
          }
        });

      if (error) throw error;

      toast({
        title: "Order Placed!",
        description: "Your order has been confirmed",
      });

      setCart([]);
      loadOrderHistory(userInfo.id);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  };

  const filteredMedicines = medicines.filter(med => 
    med.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/user-dashboard')}>
              ← Back
            </Button>
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Medical Shop</span>
          </div>
          
          <Button variant="outline" className="relative" onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {cart.length}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">
              <Package className="mr-2 h-4 w-4" />
              Browse Medicines
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Clock className="mr-2 h-4 w-4" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Shop Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Medical Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedShop?.id === shop.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedShop(shop);
                        loadMedicines(shop.id);
                      }}
                    >
                      <h3 className="font-semibold">{shop.shop_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3" />
                        {shop.city}, {shop.state}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{shop.ratings || 0}</span>
                        </div>
                        <Badge variant={shop.is_open ? "default" : "secondary"}>
                          {shop.is_open ? "Open" : "Closed"}
                        </Badge>
                        {shop.delivery_available && (
                          <Badge variant="outline">Delivery</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medicine Browse */}
            {selectedShop && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedShop.shop_name} - Medicines</CardTitle>
                      <CardDescription>Browse and order medicines</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Medicines */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : filteredMedicines.length > 0 ? (
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                      {filteredMedicines.map((medicine) => (
                        <div key={medicine.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold">{medicine.medicine_name}</h3>
                              {medicine.generic_name && (
                                <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                              )}
                              {medicine.manufacturer && (
                                <p className="text-xs text-muted-foreground mt-1">By {medicine.manufacturer}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">₹{medicine.price}</p>
                              <Badge variant={medicine.stock_quantity > 10 ? "default" : "destructive"} className="mt-1">
                                {medicine.stock_quantity} in stock
                              </Badge>
                            </div>
                          </div>
                          
                          {medicine.expiry_date && (
                            <p className="text-xs text-muted-foreground mb-3">
                              Expiry: {new Date(medicine.expiry_date).toLocaleDateString()}
                            </p>
                          )}

                          <Button 
                            className="w-full" 
                            onClick={() => addToCart(medicine)}
                            disabled={medicine.stock_quantity === 0}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No medicines found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Shopping Cart */}
            <div id="cart-section">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Cart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length > 0 ? (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.medicine_name}</h4>
                            <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={item.quantity >= item.stock_quantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="font-bold w-20 text-right">₹{item.price * item.quantity}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-2xl font-bold">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={placeOrder}>
                          Place Order
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Your cart is empty</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Your past medicine orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">
                          Shop: {order.details?.shop_name}
                        </p>
                        <div className="text-sm text-muted-foreground mb-2">
                          {order.details?.items?.map((item, idx) => (
                            <div key={idx}>
                              • {item.medicine_name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                        <p className="font-bold">Total: ₹{order.payment_amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet</p>
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

export default MedicalShopPage;