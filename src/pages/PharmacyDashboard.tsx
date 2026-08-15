import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Truck,
  Plus,
  Building2,
  TrendingDown,
  TrendingUp,
  Search,
  Pill,
  MapPin,
  Phone,
  User,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  medicine_id: string;
  name: string;
  brand?: string | null;
  image_url?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}
interface MedicineOrder {
  id: string;
  patient_name: string;
  disease_name: string;
  medicine_name: string;
  quantity: number;
  status: string;
  created_at: string;
  order_number: string | null;
  subtotal: number;
  gst: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  payment_status: string;
  delivery_address: any;
  items: OrderItem[] | null;
  timeline: { status: string; at: string }[] | null;
  estimated_delivery: string | null;
}

const STAGES = ['Ordered', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
const NEXT_LABEL: Record<string, string> = {
  Ordered: 'Confirm order',
  Confirmed: 'Mark packed',
  Packed: 'Mark shipped',
  Shipped: 'Out for delivery',
  'Out for Delivery': 'Mark delivered',
};

interface InventoryItem {
  id: string;
  medicine_name: string;
  category: string;
  quantity: number;
  price: number;
  low_stock_threshold: number;
}

const PharmacyDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'orders';
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMedicine, setNewMedicine] = useState({
    medicine_name: '',
    category: '',
    quantity: 0,
    price: 0,
    low_stock_threshold: 10
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchInventory();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const { data: pharmacyData } = await supabase
        .from('pharmacy_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setProfile({ ...profileData, ...pharmacyData });
    }
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('medicine_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as any);
  };

  const fetchInventory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('medicine_inventory')
        .select('*')
        .eq('pharmacy_id', user.id)
        .order('medicine_name');
      if (data) setInventory(data);
    }
  };

  const currentStage = (o: MedicineOrder) => {
    const last = (o.timeline || [])[o.timeline!.length - 1]?.status || 'Ordered';
    const idx = STAGES.indexOf(last);
    return idx < 0 ? 0 : idx;
  };

  const advanceStage = async (order: MedicineOrder) => {
    const idx = currentStage(order);
    const next = STAGES[idx + 1];
    if (!next) return;
    const newTimeline = [...(order.timeline || []), { status: next, at: new Date().toISOString() }];
    const dbStatus = next === 'Delivered' ? 'delivered' : next === 'Confirmed' ? 'accepted' : 'processing';
    const { error } = await supabase
      .from('medicine_orders')
      .update({ timeline: newTimeline, status: dbStatus })
      .eq('id', order.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Order ${next}`, description: `${order.order_number || order.id.slice(0, 8)} → ${next}` });
      fetchOrders();
    }
  };

  const handleAddMedicine = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('medicine_inventory')
      .insert({
        pharmacy_id: user.id,
        ...newMedicine
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Medicine added to inventory",
      });
      setShowAddMedicine(false);
      setNewMedicine({
        medicine_name: '',
        category: '',
        quantity: 0,
        price: 0,
        low_stock_threshold: 10
      });
      fetchInventory();
    }
  };

  const handleUpdateStock = async (id: string, newQuantity: number) => {
    const { error } = await supabase
      .from('medicine_inventory')
      .update({ quantity: newQuantity })
      .eq('id', id);

    if (!error) {
      fetchInventory();
      toast({
        title: "Stock Updated",
        description: "Inventory has been updated successfully.",
      });
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const pendingOrders = orders.filter(o => currentStage(o) === 0 && o.status !== 'cancelled');
  const lowStockItems = inventory.filter(i => i.quantity <= i.low_stock_threshold);
  const filteredInventory = inventory.filter(i => 
    i.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-8 h-8 text-secondary" />
              Pharmacy Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {profile?.pharmacy_name || profile?.full_name || 'Pharmacy Owner'}!
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {profile?.is_verified ? '✓ Verified' : 'Pending Verification'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{pendingOrders.length}</p>
              <p className="text-xs text-muted-foreground">Pending Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeOrders.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p>
              <p className="text-xs text-muted-foreground">Low Stock Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inventory.length}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  {lowStockItems.length} item(s) need restocking: {lowStockItems.map(i => i.medicine_name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Medicine Orders
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="w-4 h-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-warning" />
                Active Orders ({activeOrders.length})
              </h2>
              {activeOrders.map((order) => {
                const stageIdx = currentStage(order);
                const stage = STAGES[stageIdx];
                const nextLabel = NEXT_LABEL[stage];
                const addr = order.delivery_address || {};
                const items = (order.items as OrderItem[] | null) || [];
                return (
                  <Card key={order.id} className="border-primary/30">
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex flex-wrap justify-between gap-3 border-b pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{order.order_number || `#${order.id.slice(0, 8)}`}</span>
                            <Badge>{stage}</Badge>
                            <Badge variant="outline">{order.payment_method?.toUpperCase()} • {order.payment_status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Placed {new Date(order.created_at).toLocaleString()}
                            {order.estimated_delivery && ` • ETA ${new Date(order.estimated_delivery).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary">₹{Number(order.total || 0).toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{items.length} item(s)</div>
                        </div>
                      </div>

                      {/* Patient & delivery address */}
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-1"><User className="w-3.5 h-3.5" />Customer</div>
                          <p>{addr.name || order.patient_name}</p>
                          {addr.phone && (
                            <a href={`tel:${addr.phone}`} className="text-primary flex items-center gap-1 hover:underline">
                              <Phone className="w-3.5 h-3.5" />{addr.phone}
                            </a>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Deliver to</div>
                          <p className="text-muted-foreground">
                            {addr.line1}<br />{addr.city} — {addr.pincode}
                          </p>
                        </div>
                      </div>

                      {/* Items to prepare */}
                      <div>
                        <div className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5" />Medicines to prepare
                        </div>
                        <div className="rounded-md border divide-y">
                          {items.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground">
                              {order.medicine_name} × {order.quantity}
                            </div>
                          ) : items.map((i, k) => (
                            <div key={k} className="p-3 flex items-center gap-3">
                              <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                                {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{i.name}</div>
                                {i.brand && <div className="text-xs text-muted-foreground truncate">{i.brand}</div>}
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-semibold">Qty: {i.quantity}</div>
                                <div className="text-xs text-muted-foreground">₹{i.unit_price?.toFixed(2)} ea</div>
                              </div>
                              <div className="w-20 text-right font-semibold">₹{i.line_total?.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress + action */}
                      <div className="flex items-center justify-between text-[10px] gap-1">
                        {STAGES.map((s, k) => (
                          <div key={s} className="flex-1 flex flex-col items-center relative">
                            {k > 0 && <div className={`absolute left-0 top-2 h-0.5 w-1/2 ${k <= stageIdx ? 'bg-primary' : 'bg-muted'}`} />}
                            {k < STAGES.length - 1 && <div className={`absolute right-0 top-2 h-0.5 w-1/2 ${k < stageIdx ? 'bg-primary' : 'bg-muted'}`} />}
                            {k <= stageIdx
                              ? <CheckCircle className="w-4 h-4 text-primary bg-background z-10" />
                              : <div className="w-4 h-4 rounded-full border-2 border-muted bg-background z-10" />}
                            <span className={`mt-1 text-center ${k <= stageIdx ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                          </div>
                        ))}
                      </div>

                      {nextLabel && (
                        <div className="flex justify-end">
                          <Button onClick={() => advanceStage(order)} className="gap-2">
                            {nextLabel}<ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {completedOrders.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Delivered ({completedOrders.length})
              </h2>
              {completedOrders.slice(0, 10).map(order => (
                <Card key={order.id}>
                  <CardContent className="p-3 flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{order.order_number || order.id.slice(0, 8)}</span>
                      <span className="text-muted-foreground ml-2">{order.delivery_address?.name || order.patient_name}</span>
                    </div>
                    <div className="text-right">
                      <div>₹{Number(order.total || 0).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {orders.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Orders Yet</h3>
                <p className="text-muted-foreground">Orders from patients will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddMedicine(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Medicine
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className={item.quantity <= item.low_stock_threshold ? 'border-destructive/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Pill className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.medicine_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.category && <Badge variant="outline">{item.category}</Badge>}
                          <span className="text-sm text-muted-foreground">${item.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <Badge variant={item.quantity <= item.low_stock_threshold ? "destructive" : "secondary"}>
                            {item.quantity}
                          </Badge>
                        </div>
                        {item.quantity <= item.low_stock_threshold && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <TrendingDown className="w-3 h-3" />
                            Low Stock
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStock(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 0}
                        >
                          -
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStock(item.id, item.quantity + 10)}
                        >
                          <TrendingUp className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {inventory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Inventory Yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding medicines to your inventory.</p>
                  <Button onClick={() => setShowAddMedicine(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Medicine
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Medicine Dialog */}
      <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine to Inventory</DialogTitle>
            <DialogDescription>
              Enter the details of the medicine you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <Input
                placeholder="e.g., Paracetamol 500mg"
                value={newMedicine.medicine_name}
                onChange={(e) => setNewMedicine({...newMedicine, medicine_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="e.g., Pain Relief"
                  value={newMedicine.category}
                  onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newMedicine.price || ''}
                  onChange={(e) => setNewMedicine({...newMedicine, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newMedicine.quantity || ''}
                  onChange={(e) => setNewMedicine({...newMedicine, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Alert</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={newMedicine.low_stock_threshold || ''}
                  onChange={(e) => setNewMedicine({...newMedicine, low_stock_threshold: parseInt(e.target.value) || 10})}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddMedicine(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMedicine} disabled={!newMedicine.medicine_name}>
                Add Medicine
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyDashboard;
