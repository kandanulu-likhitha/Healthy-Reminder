import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart, priceAfterDiscount, calcTotals } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Trash2, Plus, Minus, Bookmark, BookmarkCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(true);
  const { active, saved, updateQuantity, removeItem, toggleSaveForLater, loading } = useCart();
  const { toast } = useToast();
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<'HEALTH10' | null>(null);

  const totals = calcTotals(active, promo);

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === 'HEALTH10') {
      setPromo('HEALTH10');
      toast({ title: 'Promo applied', description: '10% off your subtotal.' });
    } else {
      toast({ title: 'Invalid code', variant: 'destructive' });
    }
  };

  if (authLoading || loading) return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-6"><ShoppingCart className="w-8 h-8 text-primary" />Your Cart</h1>

      {active.length === 0 && saved.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/shop"><Button>Browse pharmacy</Button></Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            {active.map(item => {
              const price = priceAfterDiscount(item.medicine);
              return (
                <Card key={item.id} className="p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-md bg-muted overflow-hidden shrink-0">
                    {item.medicine.image_url && <img src={item.medicine.image_url} alt={item.medicine.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold leading-tight">{item.medicine.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.medicine.brand} • {item.medicine.strength}</p>
                        {item.medicine.prescription_required && <Badge variant="outline" className="mt-1 text-xs">Prescription required</Badge>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₹{(price * item.quantity).toFixed(2)}</div>
                        {item.quantity > 1 && <div className="text-xs text-muted-foreground">₹{price} each</div>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.medicine.stock}><Plus className="w-3 h-3" /></Button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleSaveForLater(item.id, true)}><Bookmark className="w-3 h-3 mr-1" />Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}><Trash2 className="w-3 h-3 mr-1" />Remove</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {saved.length > 0 && (
              <div className="pt-4">
                <h2 className="font-semibold mb-3">Saved for later ({saved.length})</h2>
                <div className="space-y-2">
                  {saved.map(item => (
                    <Card key={item.id} className="p-3 flex items-center gap-3">
                      <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0">
                        {item.medicine.image_url && <img src={item.medicine.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.medicine.name}</p>
                        <p className="text-xs text-muted-foreground">₹{priceAfterDiscount(item.medicine)}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toggleSaveForLater(item.id, false)}><BookmarkCheck className="w-3 h-3 mr-1" />Move to cart</Button>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-3 h-3" /></Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="p-5 sticky top-20 space-y-4">
              <h3 className="font-semibold">Order summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                {totals.promoDiscount > 0 && <div className="flex justify-between text-green-600"><span>Promo (HEALTH10)</span><span>−₹{totals.promoDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{totals.gst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{totals.delivery === 0 ? <span className="text-green-600">FREE</span> : `₹${totals.delivery.toFixed(2)}`}</span></div>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span><span>₹{totals.total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                <Button variant="outline" onClick={applyPromo}>Apply</Button>
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate('/checkout')} disabled={active.length === 0}>
                Proceed to checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center">Free delivery on orders above ₹500</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;