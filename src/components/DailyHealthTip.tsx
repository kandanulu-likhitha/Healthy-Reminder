import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HEALTH_TIPS = [
  { tip: "Drink warm water with cumin (zeera) seeds every morning — it boosts digestion and reduces bloating.", category: "Digestion", ingredient: "🫗 Cumin Seeds" },
  { tip: "Add a pinch of turmeric (haldi) to warm milk before bed — it reduces inflammation and improves sleep.", category: "Immunity", ingredient: "🥛 Turmeric Milk" },
  { tip: "Chew 2-3 soaked almonds every morning on an empty stomach — it sharpens memory and strengthens the heart.", category: "Brain Health", ingredient: "🥜 Almonds" },
  { tip: "Drink a glass of warm water with lemon and honey first thing in the morning — it detoxifies and boosts metabolism.", category: "Detox", ingredient: "🍋 Lemon + Honey" },
  { tip: "Add cinnamon (dalchini) to your tea — it helps regulate blood sugar levels naturally.", category: "Diabetes", ingredient: "🫖 Cinnamon Tea" },
  { tip: "Eat a spoonful of soaked fenugreek (methi) seeds daily — it lowers cholesterol and controls blood sugar.", category: "Heart Health", ingredient: "🌱 Fenugreek Seeds" },
  { tip: "Drink ajwain (carom seeds) water after meals — it prevents acidity, gas, and indigestion.", category: "Digestion", ingredient: "💧 Carom Water" },
  { tip: "Eat a small piece of fresh ginger with salt before meals — it improves appetite and digestion.", category: "Appetite", ingredient: "🫚 Ginger" },
  { tip: "Mix black pepper with honey and take it in the morning — it clears congestion and boosts immunity.", category: "Immunity", ingredient: "🍯 Pepper + Honey" },
  { tip: "Soak 1 tsp of chia seeds in water overnight and drink it — it keeps you hydrated and full of energy.", category: "Energy", ingredient: "🥤 Chia Seeds" },
  { tip: "Eat one amla (Indian gooseberry) daily — it's the richest source of Vitamin C and strengthens immunity.", category: "Immunity", ingredient: "🟢 Amla" },
  { tip: "Drink fennel (saunf) water throughout the day — it cools the body and improves eyesight.", category: "Cooling", ingredient: "🌿 Fennel Water" },
  { tip: "Add fresh curry leaves to your food — they help control diabetes and improve hair health.", category: "Diabetes", ingredient: "🍃 Curry Leaves" },
  { tip: "Eat a banana with cardamom powder — it regulates blood pressure and gives instant energy.", category: "Blood Pressure", ingredient: "🍌 Banana + Cardamom" },
  { tip: "Drink warm water with a pinch of black salt — it relieves constipation and improves gut health.", category: "Gut Health", ingredient: "🧂 Black Salt Water" },
  { tip: "Eat soaked raisins (kishmish) every morning — they purify blood and improve iron levels.", category: "Blood Health", ingredient: "🍇 Soaked Raisins" },
  { tip: "Add flaxseeds (alsi) to your morning smoothie — they are rich in omega-3 and reduce joint pain.", category: "Joint Health", ingredient: "🌾 Flaxseeds" },
  { tip: "Drink coconut water daily — it balances electrolytes, hydrates, and supports kidney function.", category: "Hydration", ingredient: "🥥 Coconut Water" },
  { tip: "Chew a few tulsi (holy basil) leaves every morning — it fights infections and reduces stress.", category: "Stress Relief", ingredient: "🌿 Tulsi Leaves" },
  { tip: "Eat papaya on an empty stomach — it cleanses the digestive system and improves skin glow.", category: "Skin Health", ingredient: "🍈 Papaya" },
  { tip: "Drink coriander (dhaniya) seed water — it helps reduce cholesterol and detoxifies kidneys.", category: "Kidney Health", ingredient: "🫧 Coriander Water" },
  { tip: "Mix isabgol (psyllium husk) with warm water before bed — it regulates bowel movements naturally.", category: "Digestion", ingredient: "🥣 Isabgol" },
  { tip: "Eat a handful of pumpkin seeds — they are rich in zinc and boost immunity and prostate health.", category: "Men's Health", ingredient: "🎃 Pumpkin Seeds" },
  { tip: "Drink warm water with rock salt after a heavy meal — it speeds up digestion and prevents bloating.", category: "Digestion", ingredient: "💎 Rock Salt Water" },
  { tip: "Add jaggery (gur) to your diet instead of sugar — it's rich in iron and purifies blood.", category: "Blood Health", ingredient: "🟤 Jaggery" },
  { tip: "Eat beetroot salad regularly — it improves blood flow, stamina, and lowers blood pressure.", category: "Blood Pressure", ingredient: "🥗 Beetroot" },
  { tip: "Drink warm milk with nutmeg (jaiphal) — it cures insomnia and calms the nervous system.", category: "Sleep", ingredient: "🌙 Nutmeg Milk" },
  { tip: "Take a spoonful of gulkand (rose petal jam) — it cools the body and prevents acidity in summers.", category: "Cooling", ingredient: "🌹 Gulkand" },
  { tip: "Eat garlic on an empty stomach — it lowers blood pressure, reduces cholesterol, and fights infections.", category: "Heart Health", ingredient: "🧄 Raw Garlic" },
  { tip: "Drink triphala powder with warm water before bed — it improves digestion and detoxifies the body.", category: "Ayurveda", ingredient: "🍵 Triphala" },
  { tip: "Soak sabja (basil) seeds in water and drink — they cool the body and aid weight management.", category: "Weight", ingredient: "🫧 Basil Seeds" },
];

const DailyHealthTip = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Pick tip based on day of year so it changes daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setTipIndex(dayOfYear % HEALTH_TIPS.length);
  }, []);

  const showNextTip = () => {
    setAnimate(true);
    setTimeout(() => {
      setTipIndex(prev => (prev + 1) % HEALTH_TIPS.length);
      setAnimate(false);
    }, 200);
  };

  const tip = HEALTH_TIPS[tipIndex];

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div className={`flex-1 transition-opacity duration-200 ${animate ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm text-primary">💡 Today's Health Tip</h3>
              <Badge variant="outline" className="text-xs">{tip.category}</Badge>
            </div>
            <p className="text-sm leading-relaxed">{tip.tip}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Leaf className="w-3 h-3" />
                <span>{tip.ingredient}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={showNextTip} className="text-xs gap-1 h-7">
                <RefreshCw className="w-3 h-3" />
                Next Tip
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyHealthTip;
