import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart, priceAfterDiscount, calcTotals } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const genOrderNumber = () => 'HR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

const Checkout = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth(true);
  const { active, clearCart, loading } = useCart();
  const { toast } = useToast();

  const [address, setAddress] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    line1: profile?.address || '',
    city: '',
    pincode: '',
  });
  const [payment, setPayment] = useState<'cod' | 'card'>('cod');
  const [placing, setPlacing] = useState(false);
  const totals = calcTotals(active);

  const placeOrder = async () => {
    if (!user) return;
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast({ title: 'Missing details', description: 'Please fill in your delivery address.', variant: 'destructive' });
      return;
    }
    if (active.length === 0) return;
    setPlacing(true);

    const items = active.map(i => ({
      medicine_id: i.medicine.id,
      name: i.medicine.name,
      brand: i.medicine.brand,
      image_url: i.medicine.image_url,
      quantity: i.quantity,
      unit_price: priceAfterDiscount(i.medicine),
      line_total: +(priceAfterDiscount(i.medicine) * i.quantity).toFixed(2),
    }));

    const now = new Date();
    const eta = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const order_number = genOrderNumber();

    const { error } = await supabase.from('medicine_orders').insert({
      patient_id: user.id,
      patient_name: address.name,
      disease_name: 'Multiple',
      medicine_name: items.map(i => i.name).join(', ').slice(0, 250),
      quantity: items.reduce((s, i) => s + i.quantity, 0),
      status: 'pending',
      order_number,
      subtotal: totals.subtotal,
      gst: totals.gst,
      delivery_charge: totals.delivery,
      total: totals.total,
      payment_method: payment,
      payment_status: payment === 'card' ? 'paid' : 'pending',
      delivery_address: address,
      items,
      timeline: [{ status: 'Ordered', at: now.toISOString() }],
      estimated_delivery: eta.toISOString(),
    });

    if (error) {
      toast({ title: 'Order failed', description: error.message, variant: 'destructive' });
      setPlacing(false);
      return;
    }

    await clearCart();
    toast({ title: 'Order placed! 🎉', description: `Order ${order_number} confirmed.` });
    navigate('/orders');
  };

  if (authLoading || loading) return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  if (!user) return null;

  if (active.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate('/shop')}>Browse pharmacy</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-primary" />Delivery address</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full name</Label><Input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
              <div className="col-span-2"><Label>Address</Label><Textarea rows={2} value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} /></div>
              <div><Label>City</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
              <div><Label>Pincode</Label><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" />Payment method</h2>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as any)} className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent">
                <RadioGroupItem value="cod" id="cod" />
                <div><div className="font-medium">Cash on Delivery</div><div className="text-xs text-muted-foreground">Pay when you receive.</div></div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent">
                <RadioGroupItem value="card" id="card" />
                <div><div className="font-medium">Card / UPI (simulated)</div><div className="text-xs text-muted-foreground">Marked as paid instantly for demo.</div></div>
              </label>
            </RadioGroup>
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20 flex items-start gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            This is a simulated checkout for demonstration. No real payment is processed.
          </Card>
        </div>

        <Card className="p-5 h-fit sticky top-20 space-y-3">
          <h3 className="font-semibold">Summary</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {active.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="truncate pr-2">{i.medicine.name} × {i.quantity}</span>
                <span>₹{(priceAfterDiscount(i.medicine) * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>₹{totals.gst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{totals.delivery === 0 ? 'FREE' : `₹${totals.delivery.toFixed(2)}`}</span></div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span>₹{totals.total.toFixed(2)}</span>
          </div>
          <Button className="w-full" size="lg" onClick={placeOrder} disabled={placing}>
            {placing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing...</> : 'Place order'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;