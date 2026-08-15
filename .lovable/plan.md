## Phase 1: Real Pharmacy + Cart + Orders

Transform the Shop and Orders experience from dummy data into a disease-filtered pharmacy with a real cart, simulated checkout, saved orders, and a status timeline. Uses the existing 15 diseases as the filter source.

### 1. Database changes (one migration)

New `medicines` catalog table (curated, ~40-60 rows across the 15 diseases):

```
medicines
  id, name, generic_name, brand, manufacturer, strength,
  disease_ids text[]        -- links to diseases.ts ids
  price numeric, discount_pct int, image_url,
  dosage, uses, side_effects[], warnings,
  prescription_required bool, rating numeric,
  delivery_days int
```

Extend `medicine_orders` (keep existing rows working):
- add `order_number` (human ID), `subtotal`, `gst`, `delivery_charge`, `total`, `payment_method`, `payment_status`, `delivery_address`, `items jsonb` (line items snapshot), `timeline jsonb` (status history)

New `cart_items` table: `user_id, medicine_id, quantity, saved_for_later`.

RLS: `medicines` readable by anon+authenticated; `cart_items` and `medicine_orders` scoped to `auth.uid()`; pharmacy role can read/update orders assigned to them. All new public tables get proper GRANTs.

Seed the catalog via a data insert after migration approval (real medicines mapped per disease: Hypertension → Amlodipine/Telmisartan/Losartan + BP monitor; Diabetes → Metformin/Glimepiride/Insulin/glucometer strips; Asthma → Salbutamol/Budesonide inhaler/Montelukast; Migraine → Sumatriptan/Naproxen; Gastritis → Pantoprazole/Omeprazole; etc.).

### 2. Shop page rewrite (`src/pages/Shop.tsx`)

- Reads `?disease=<id>` from URL (already supported) and defaults to the last-viewed disease stored in `localStorage`.
- If no disease selected → show disease category grid with CTA "Select your condition to see recommended medicines".
- If disease selected → header shows the disease name + "Recommended for you", with a chip to change or clear.
- Fetches `medicines` where `disease_ids` contains the selected id.
- Search box, filters (price range, prescription required, in-stock, min rating), sort (price asc, rating desc, delivery time).
- Medicine card: image, name, brand, strength, price with strike-through original, discount badge, stock, prescription-required badge, rating, Add to Cart, View Details.
- Details dialog: image, generic/brand, composition, uses, dosage, storage, side effects, warnings, alternatives (other meds sharing the same disease), Add to Cart.

### 3. Cart (`src/pages/Cart.tsx` + `useCart` hook)

- Live-synced with `cart_items` table (per user).
- Line items with qty steppers, remove, "Save for later".
- Order summary: subtotal, GST 5%, delivery (free over ₹500), grand total.
- Promo code field (mock: `HEALTH10` = 10% off).
- Cart badge in header.

### 4. Checkout (`src/pages/Checkout.tsx`)

- Simulated: delivery address form, payment method radio (COD / Card mock), place order.
- Creates a `medicine_orders` row with snapshot of cart items, totals, initial timeline `[Ordered]`, clears cart, redirects to Orders.

### 5. Orders page (`src/pages/Orders.tsx`)

- Lists real orders for the logged-in user, newest first.
- Order card: order number, thumbnail row, meds, disease tag, qty, totals breakdown, date, ETA, address, payment status, order status.
- Visual timeline: Ordered → Confirmed → Packed → Shipped → Out for Delivery → Delivered (each step timestamped from `timeline` jsonb).
- Actions: Track (expands timeline), Cancel (if not shipped), Reorder (adds items back to cart), Download Invoice (client-side PDF via `jspdf`).

### 6. Pharmacy dashboard tie-in

Update `PharmacyDashboard.tsx` order actions (Accept / Pack / Ship / Deliver) to append entries to the new `timeline` jsonb so patients see live status changes.

### 7. Routing & nav

- Add routes `/cart`, `/checkout`, `/orders`.
- Add Cart + Orders links to `Header.tsx` for patients.
- Update Disease detail page's "Order Medicines" button to `/shop?disease=<id>`.

### Out of scope for this phase

Disease recommendation upgrade, AI insights, medical report upload, doctor booking, health dashboard redesign, real payments. These are Phase 2+ and I'll plan them separately when you're ready.

### Technical notes

- New dependency: `jspdf` for invoice PDF.
- Medicine images: use free CDN placeholders (e.g., `https://images.unsplash.com/...` pill photos) seeded per row; can be swapped later.
- Cart state: DB-backed via a lightweight `useCart` hook (React Query) so it persists across devices.
