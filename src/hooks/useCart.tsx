import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Medicine {
  id: string;
  name: string;
  generic_name: string | null;
  brand: string | null;
  manufacturer: string | null;
  strength: string | null;
  disease_ids: string[];
  category: string | null;
  price: number;
  discount_pct: number;
  image_url: string | null;
  dosage: string | null;
  uses: string | null;
  composition: string | null;
  side_effects: string[];
  warnings: string | null;
  storage: string | null;
  prescription_required: boolean;
  rating: number;
  delivery_days: number;
  stock: number;
}

export interface CartItem {
  id: string;
  medicine_id: string;
  quantity: number;
  saved_for_later: boolean;
  medicine: Medicine;
}

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('id, medicine_id, quantity, saved_for_later, medicine:medicines(*)')
      .eq('user_id', user.id);
    setItems((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (medicineId: string, quantity = 1) => {
    if (!user) return { error: 'Please login to add items to cart' };
    const existing = items.find(i => i.medicine_id === medicineId && !i.saved_for_later);
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').upsert(
        { user_id: user.id, medicine_id: medicineId, quantity, saved_for_later: false },
        { onConflict: 'user_id,medicine_id' }
      );
    }
    await fetchCart();
    return { error: null };
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    await supabase.from('cart_items').update({ quantity }).eq('id', id);
    await fetchCart();
  };

  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    await fetchCart();
  };

  const toggleSaveForLater = async (id: string, saved: boolean) => {
    await supabase.from('cart_items').update({ saved_for_later: saved }).eq('id', id);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id).eq('saved_for_later', false);
    await fetchCart();
  };

  const active = items.filter(i => !i.saved_for_later);
  const saved = items.filter(i => i.saved_for_later);
  const count = active.reduce((s, i) => s + i.quantity, 0);

  return { items, active, saved, count, loading, addToCart, updateQuantity, removeItem, toggleSaveForLater, clearCart, refetch: fetchCart };
};

export const priceAfterDiscount = (m: Pick<Medicine, 'price' | 'discount_pct'>) =>
  +(m.price * (1 - m.discount_pct / 100)).toFixed(2);

export const calcTotals = (active: CartItem[], promo: 'HEALTH10' | null = null) => {
  const subtotal = active.reduce((s, i) => s + priceAfterDiscount(i.medicine) * i.quantity, 0);
  const promoDiscount = promo === 'HEALTH10' ? +(subtotal * 0.1).toFixed(2) : 0;
  const afterPromo = subtotal - promoDiscount;
  const gst = +(afterPromo * 0.05).toFixed(2);
  const delivery = afterPromo >= 500 || afterPromo === 0 ? 0 : 40;
  const total = +(afterPromo + gst + delivery).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), promoDiscount, gst, delivery, total };
};