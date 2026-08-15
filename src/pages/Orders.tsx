import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Package, Loader2, Download, RotateCcw, X, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import jsPDF from 'jspdf';

interface OrderItem {
  medicine_id: string;
  name: string;
  brand?: string | null;
  image_url?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}
interface Order {
  id: string;
  order_number: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  gst: number;
  delivery_charge: number;
  total: number;
  items: OrderItem[];
  timeline: { status: string; at: string }[];
  delivery_address: any;
  estimated_delivery: string | null;
  created_at: string;
  disease_name: string;
}

const STAGES = ['Ordered', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const Orders = () => {
  const { user, loading: authLoading } = useAuth(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('medicine_orders')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });
    setOrders((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  const cancelOrder = async (id: string) => {
    await supabase.from('medicine_orders').update({ status: 'cancelled' }).eq('id', id);
    toast({ title: 'Order cancelled' });
    fetchOrders();
  };

  const reorder = async (order: Order) => {
    for (const item of order.items || []) {
      await addToCart(item.medicine_id, item.quantity);
    }
    toast({ title: 'Added to cart', description: `${order.items?.length || 0} items from ${order.order_number}` });
  };

  const downloadInvoice = (order: Order) => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Healthy Reminder — Invoice', 14, 20);
    doc.setFontSize(10);
    doc.text(`Order: ${order.order_number || order.id.slice(0, 8)}`, 14, 30);
    doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 14, 36);
    doc.text(`Status: ${order.status}    Payment: ${order.payment_method.toUpperCase()} (${order.payment_status})`, 14, 42);

    const addr = order.delivery_address || {};
    doc.text('Delivery Address:', 14, 52);
    doc.text(`${addr.name || ''}, ${addr.phone || ''}`, 14, 58);
    doc.text(`${addr.line1 || ''}, ${addr.city || ''} — ${addr.pincode || ''}`, 14, 64);

    doc.setFontSize(11); doc.text('Items', 14, 76);
    doc.setFontSize(9);
    let y = 84;
    doc.text('Medicine', 14, y); doc.text('Qty', 130, y); doc.text('Price', 150, y); doc.text('Total', 175, y);
    y += 4; doc.line(14, y, 195, y); y += 6;
    (order.items || []).forEach(i => {
      doc.text(i.name.slice(0, 60), 14, y);
      doc.text(String(i.quantity), 130, y);
      doc.text(`₹${i.unit_price.toFixed(2)}`, 150, y);
      doc.text(`₹${i.line_total.toFixed(2)}`, 175, y);
      y += 6;
    });
    y += 4; doc.line(14, y, 195, y); y += 8;
    doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`, 130, y); y += 6;
    doc.text(`GST (5%): ₹${order.gst.toFixed(2)}`, 130, y); y += 6;
    doc.text(`Delivery: ₹${order.delivery_charge.toFixed(2)}`, 130, y); y += 6;
    doc.setFontSize(11); doc.text(`Total: ₹${order.total.toFixed(2)}`, 130, y);
    doc.save(`invoice-${order.order_number || order.id.slice(0, 8)}.pdf`);
  };

  const currentStageIndex = (order: Order) => {
    if (order.status === 'cancelled') return -1;
    const last = order.timeline?.[order.timeline.length - 1]?.status;
    const idx = STAGES.indexOf(last || 'Ordered');
    return idx < 0 ? 0 : idx;
  };

  if (authLoading || loading) return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-6"><Package className="w-8 h-8 text-primary" />My Orders</h1>

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No orders yet.</p>
          <Link to="/shop"><Button>Browse pharmacy</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const stageIdx = currentStageIndex(order);
            const isExpanded = expanded === order.id;
            const cancelled = order.status === 'cancelled';
            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.order_number || order.id.slice(0, 8)}</span>
                      <Badge variant={cancelled ? 'destructive' : stageIdx === 5 ? 'default' : 'secondary'}>
                        {cancelled ? 'Cancelled' : STAGES[stageIdx]}
                      </Badge>
                      <Badge variant="outline">{order.payment_status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Placed {new Date(order.created_at).toLocaleDateString()} • {(order.items || []).length} item(s)
                      {order.estimated_delivery && ` • ETA ${new Date(order.estimated_delivery).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{order.total.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground uppercase">{order.payment_method}</div>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 mb-3">
                  {(order.items || []).slice(0, 6).map((i, k) => (
                    <div key={k} className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0" title={i.name}>
                      {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>

                {!cancelled && (
                  <div className="flex items-center justify-between text-xs mb-3">
                    {STAGES.map((s, k) => (
                      <div key={s} className="flex-1 flex flex-col items-center relative">
                        {k > 0 && <div className={`absolute left-0 top-2 h-0.5 w-1/2 ${k <= stageIdx ? 'bg-primary' : 'bg-muted'}`} />}
                        {k < STAGES.length - 1 && <div className={`absolute right-0 top-2 h-0.5 w-1/2 ${k < stageIdx ? 'bg-primary' : 'bg-muted'}`} />}
                        {k <= stageIdx
                          ? <CheckCircle2 className="w-4 h-4 text-primary bg-background z-10" />
                          : <Circle className="w-4 h-4 text-muted-foreground bg-background z-10" />}
                        <span className={`mt-1 text-[10px] text-center ${k <= stageIdx ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setExpanded(isExpanded ? null : order.id)}>
                    {isExpanded ? <><ChevronUp className="w-3 h-3 mr-1" />Hide details</> : <><ChevronDown className="w-3 h-3 mr-1" />View details</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadInvoice(order)}><Download className="w-3 h-3 mr-1" />Invoice</Button>
                  <Button variant="outline" size="sm" onClick={() => reorder(order)}><RotateCcw className="w-3 h-3 mr-1" />Reorder</Button>
                  {!cancelled && stageIdx < 3 && (
                    <Button variant="ghost" size="sm" onClick={() => cancelOrder(order.id)} className="text-destructive"><X className="w-3 h-3 mr-1" />Cancel</Button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">Items</h4>
                      {(order.items || []).map((i, k) => (
                        <div key={k} className="flex justify-between py-1">
                          <span>{i.name} × {i.quantity}</span>
                          <span>₹{i.line_total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>₹{order.gst.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>₹{order.delivery_charge.toFixed(2)}</span></div>
                      <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>
                    </div>
                    {order.delivery_address && (
                      <div>
                        <h4 className="font-semibold mb-1">Delivery to</h4>
                        <p className="text-muted-foreground">
                          {order.delivery_address.name}, {order.delivery_address.phone}<br />
                          {order.delivery_address.line1}, {order.delivery_address.city} — {order.delivery_address.pincode}
                        </p>
                      </div>
                    )}
                    {order.timeline?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-1">Timeline</h4>
                        {order.timeline.map((t, k) => (
                          <div key={k} className="flex justify-between text-xs text-muted-foreground">
                            <span>{t.status}</span><span>{new Date(t.at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;