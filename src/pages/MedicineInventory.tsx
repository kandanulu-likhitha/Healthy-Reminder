import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Pill, 
  Plus, 
  AlertTriangle, 
  Package, 
  RefreshCw, 
  Loader2,
  Calendar,
  TrendingDown,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, differenceInDays } from 'date-fns';

interface MedicineInventory {
  id: string;
  medicine_name: string;
  current_quantity: number;
  doses_per_day: number;
  low_stock_threshold: number;
  last_refill_date: string | null;
  reminder_id: string | null;
}

const MedicineInventoryPage = () => {
  const { user, loading: authLoading } = useAuth(true);
  const [inventory, setInventory] = useState<MedicineInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    currentQuantity: '',
    dosesPerDay: '1',
    lowStockThreshold: '7'
  });
  const { toast } = useToast();

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('patient_medicine_inventory')
      .select('*')
      .eq('patient_id', user.id)
      .order('medicine_name');

    if (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load medicine inventory",
        variant: "destructive"
      });
    } else {
      setInventory(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user, fetchInventory]);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.medicineName.trim() || !formData.currentQuantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('patient_medicine_inventory')
      .insert({
        patient_id: user.id,
        medicine_name: formData.medicineName,
        current_quantity: parseInt(formData.currentQuantity),
        doses_per_day: parseInt(formData.dosesPerDay),
        low_stock_threshold: parseInt(formData.lowStockThreshold),
        last_refill_date: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding medicine:', error);
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Medicine Added",
        description: `${formData.medicineName} added to your inventory`,
      });
      setFormData({
        medicineName: '',
        currentQuantity: '',
        dosesPerDay: '1',
        lowStockThreshold: '7'
      });
      setShowAddForm(false);
      fetchInventory();
    }
    setSaving(false);
  };

  const handleRefill = async (medicine: MedicineInventory, quantity: number) => {
    const { error } = await supabase
      .from('patient_medicine_inventory')
      .update({
        current_quantity: medicine.current_quantity + quantity,
        last_refill_date: new Date().toISOString()
      })
      .eq('id', medicine.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Refill Recorded",
        description: `Added ${quantity} doses of ${medicine.medicine_name}`,
      });
      fetchInventory();
    }
  };

  const handleTakeDose = async (medicine: MedicineInventory) => {
    if (medicine.current_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: "Please refill this medicine",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('patient_medicine_inventory')
      .update({
        current_quantity: medicine.current_quantity - 1
      })
      .eq('id', medicine.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Dose Taken",
        description: `${medicine.medicine_name} - 1 dose recorded`,
      });
      fetchInventory();
    }
  };

  const getDaysRemaining = (medicine: MedicineInventory) => {
    return Math.floor(medicine.current_quantity / medicine.doses_per_day);
  };

  const getRunOutDate = (medicine: MedicineInventory) => {
    const days = getDaysRemaining(medicine);
    return addDays(new Date(), days);
  };

  const getStockStatus = (medicine: MedicineInventory) => {
    const days = getDaysRemaining(medicine);
    if (days <= 0) return { status: 'empty', color: 'destructive' as const };
    if (days <= medicine.low_stock_threshold / 2) return { status: 'critical', color: 'destructive' as const };
    if (days <= medicine.low_stock_threshold) return { status: 'low', color: 'secondary' as const };
    return { status: 'good', color: 'default' as const };
  };

  const getLowStockMedicines = () => {
    return inventory.filter(m => getDaysRemaining(m) <= m.low_stock_threshold);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Medicine Inventory
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your medicine stock and get refill reminders
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      {/* Low Stock Alert */}
      {getLowStockMedicines().length > 0 && (
        <Card className="p-4 mb-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Low Stock Alert!</p>
              <p className="text-sm text-muted-foreground">
                {getLowStockMedicines().length} medicine(s) running low. Consider refilling soon.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {getLowStockMedicines().map(m => (
                  <Badge key={m.id} variant="destructive">
                    {m.medicine_name} - {getDaysRemaining(m)} days left
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Medicine Form */}
      {showAddForm && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Medicine</h2>
          <form onSubmit={handleAddMedicine} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <Input
                placeholder="e.g., Metformin 500mg"
                value={formData.medicineName}
                onChange={(e) => setFormData({...formData, medicineName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Current Quantity (doses/pills)</Label>
              <Input
                type="number"
                placeholder="e.g., 30"
                value={formData.currentQuantity}
                onChange={(e) => setFormData({...formData, currentQuantity: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Doses Per Day</Label>
              <Input
                type="number"
                placeholder="e.g., 2"
                value={formData.dosesPerDay}
                onChange={(e) => setFormData({...formData, dosesPerDay: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Alert When (days remaining)</Label>
              <Input
                type="number"
                placeholder="e.g., 7"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Medicine'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((medicine) => {
          const daysRemaining = getDaysRemaining(medicine);
          const runOutDate = getRunOutDate(medicine);
          const stockStatus = getStockStatus(medicine);
          const progress = Math.min((daysRemaining / 30) * 100, 100);

          return (
            <Card key={medicine.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{medicine.medicine_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {medicine.doses_per_day}x daily
                  </p>
                </div>
                <Badge variant={stockStatus.color}>
                  {stockStatus.status === 'empty' && 'Out of Stock'}
                  {stockStatus.status === 'critical' && 'Critical'}
                  {stockStatus.status === 'low' && 'Low Stock'}
                  {stockStatus.status === 'good' && 'In Stock'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stock Level</span>
                    <span className="font-medium">{medicine.current_quantity} doses</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={stockStatus.status === 'good' ? '' : 'bg-destructive/20'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Days Left</p>
                      <p className="font-medium">{daysRemaining} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Runs Out</p>
                      <p className="font-medium">{format(runOutDate, 'MMM dd')}</p>
                    </div>
                  </div>
                </div>

                {medicine.last_refill_date && (
                  <p className="text-xs text-muted-foreground">
                    Last refill: {format(new Date(medicine.last_refill_date), 'MMM dd, yyyy')}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleTakeDose(medicine)}
                    disabled={medicine.current_quantity <= 0}
                  >
                    <Pill className="w-4 h-4 mr-1" />
                    Take Dose
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleRefill(medicine, 30)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refill +30
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {inventory.length === 0 && (
          <Card className="p-8 text-center md:col-span-2 lg:col-span-3">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No medicines tracked</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your medicine inventory to get refill reminders
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Medicine
            </Button>
          </Card>
        )}
      </div>

      {/* Refill Prediction Info */}
      {inventory.length > 0 && (
        <Card className="mt-8 p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Smart Refill Prediction</p>
              <p className="text-sm text-muted-foreground">
                Based on your daily dosage, we predict when your medicines will run out and alert you 
                {inventory[0]?.low_stock_threshold || 7} days before you need a refill.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MedicineInventoryPage;
