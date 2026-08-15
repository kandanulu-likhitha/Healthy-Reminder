import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { diseases, getDiseaseById } from '@/data/diseases';
import { Search, Star, ShoppingCart, Loader2, Pill, Truck, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCart, Medicine, priceAfterDiscount } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const LAST_DISEASE_KEY = 'hr:lastDisease';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { count, addToCart } = useCart();
  const { toast } = useToast();

  const urlDisease = searchParams.get('disease');
  const [diseaseId, setDiseaseId] = useState<string | null>(
    urlDisease || (typeof window !== 'undefined' ? localStorage.getItem(LAST_DISEASE_KEY) : null)
  );

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [prescriptionOnly, setPrescriptionOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [detail, setDetail] = useState<Medicine | null>(null);

  const disease = diseaseId ? getDiseaseById(diseaseId) : null;

  useEffect(() => {
    if (urlDisease && urlDisease !== diseaseId) setDiseaseId(urlDisease);
  }, [urlDisease]);

  useEffect(() => {
    if (diseaseId) localStorage.setItem(LAST_DISEASE_KEY, diseaseId);
  }, [diseaseId]);

  useEffect(() => {
    if (!diseaseId) { setMedicines([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('medicines')
      .select('*')
      .contains('disease_ids', [diseaseId])
      .then(({ data }) => {
        setMedicines((data as any) || []);
        setLoading(false);
      });
  }, [diseaseId]);

  const filtered = useMemo(() => {
    let list = medicines.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.brand?.toLowerCase().includes(search.toLowerCase())
    );
    if (prescriptionOnly) list = list.filter(m => m.prescription_required);
    if (inStockOnly) list = list.filter(m => m.stock > 0);
    list = list.filter(m => priceAfterDiscount(m) <= maxPrice);
    switch (sort) {
      case 'price-asc': list.sort((a, b) => priceAfterDiscount(a) - priceAfterDiscount(b)); break;
      case 'price-desc': list.sort((a, b) => priceAfterDiscount(b) - priceAfterDiscount(a)); break;
      case 'delivery': list.sort((a, b) => a.delivery_days - b.delivery_days); break;
      default: list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [medicines, search, sort, maxPrice, prescriptionOnly, inStockOnly]);

  const handleAdd = async (m: Medicine) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please sign in to add items to your cart.', variant: 'destructive' });
      navigate('/auth');
      return;
    }
    const { error } = await addToCart(m.id, 1);
    if (error) toast({ title: 'Error', description: error, variant: 'destructive' });
    else toast({ title: 'Added to cart', description: m.name });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" />
            Pharmacy
          </h1>
          <p className="text-muted-foreground mt-1">
            {disease ? <>Recommended for <span className="text-primary font-medium">{disease.name}</span></> : 'Choose your condition to see recommended medicines.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/orders"><Button variant="outline">My Orders</Button></Link>
          <Link to="/cart">
            <Button className="relative">
              <ShoppingCart className="w-4 h-4 mr-2" /> Cart
              {count > 0 && <span className="ml-2 bg-primary-foreground text-primary text-xs font-bold rounded-full px-2 py-0.5">{count}</span>}
            </Button>
          </Link>
        </div>
      </div>

      {!diseaseId ? (
        <div>
          <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Select your condition</h3>
                <p className="text-sm text-muted-foreground">Pick a disease to see medicines curated for it.</p>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {diseases.map(d => (
              <Card
                key={d.id}
                className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                onClick={() => { setDiseaseId(d.id); setSearchParams({ disease: d.id }); }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold group-hover:text-primary">{d.name.split('(')[0].trim()}</h3>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{d.description}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Filters */}
          <aside className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Condition</h4>
                <button onClick={() => { setDiseaseId(null); setSearchParams({}); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
              <Select value={diseaseId} onValueChange={(v) => { setDiseaseId(v); setSearchParams({ disease: v }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {diseases.map(d => <SelectItem key={d.id} value={d.id}>{d.name.split('(')[0].trim()}</SelectItem>)}
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-4 space-y-4">
              <h4 className="font-semibold">Filters</h4>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Max price</span><span className="font-medium">₹{maxPrice}</span></div>
                <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={50} max={3000} step={50} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={prescriptionOnly} onCheckedChange={(v) => setPrescriptionOnly(!!v)} />
                Prescription required only
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
                In stock only
              </label>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Sort by</h4>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="delivery">Fastest delivery</SelectItem>
                </SelectContent>
              </Select>
            </Card>
          </aside>

          {/* Product grid */}
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search medicines, brands, generics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {loading ? (
              <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-10 text-center">
                <Pill className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No medicines match your filters.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(m => {
                  const finalPrice = priceAfterDiscount(m);
                  return (
                    <Card key={m.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {m.image_url && <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" loading="lazy" />}
                        {m.discount_pct > 0 && <Badge className="absolute top-2 left-2 bg-green-600">{m.discount_pct}% OFF</Badge>}
                        {m.prescription_required && <Badge variant="outline" className="absolute top-2 right-2 bg-background/90">Rx</Badge>}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold leading-tight line-clamp-2">{m.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{m.brand} • {m.manufacturer}</p>
                        <div className="flex items-center gap-2 text-xs mt-2">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{m.rating}</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><Truck className="w-3 h-3" />{m.delivery_days}d</span>
                          <Badge variant={m.stock > 20 ? 'secondary' : 'destructive'} className="text-[10px] px-1.5 py-0">
                            {m.stock > 20 ? 'In stock' : `Only ${m.stock}`}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">₹{finalPrice}</span>
                          {m.discount_pct > 0 && <span className="text-xs text-muted-foreground line-through">₹{m.price}</span>}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetail(m)}>Details</Button>
                          <Button size="sm" className="flex-1" onClick={() => handleAdd(m)} disabled={m.stock <= 0}>
                            <ShoppingCart className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{detail.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {detail.image_url && <img src={detail.image_url} alt={detail.name} className="w-full h-full object-cover" />}
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Generic:</span> {detail.generic_name}</p>
                  <p><span className="text-muted-foreground">Brand:</span> {detail.brand}</p>
                  <p><span className="text-muted-foreground">Manufacturer:</span> {detail.manufacturer}</p>
                  <p><span className="text-muted-foreground">Strength:</span> {detail.strength}</p>
                  <p><span className="text-muted-foreground">Composition:</span> {detail.composition}</p>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-bold text-primary">₹{priceAfterDiscount(detail)}</span>
                    {detail.discount_pct > 0 && <span className="text-sm text-muted-foreground line-through">₹{detail.price}</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {detail.uses && <div><h4 className="font-semibold">Uses</h4><p className="text-muted-foreground">{detail.uses}</p></div>}
                {detail.dosage && <div><h4 className="font-semibold">Dosage</h4><p className="text-muted-foreground">{detail.dosage}</p></div>}
                {detail.side_effects?.length > 0 && (
                  <div><h4 className="font-semibold">Side effects</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {detail.side_effects.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {detail.warnings && <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20"><h4 className="font-semibold flex items-center gap-1"><AlertTriangle className="w-4 h-4" />Warnings</h4><p className="text-muted-foreground mt-1">{detail.warnings}</p></div>}
                {detail.storage && <div><h4 className="font-semibold">Storage</h4><p className="text-muted-foreground">{detail.storage}</p></div>}
              </div>
              <Button className="w-full" onClick={() => { handleAdd(detail); setDetail(null); }} disabled={detail.stock <= 0}>
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to cart
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;