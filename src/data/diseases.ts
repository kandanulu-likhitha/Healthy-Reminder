import heartBg from '@/assets/heart-bg.jpg';
import diabetesBg from '@/assets/diabetes-bg.jpg';
import respiratoryBg from '@/assets/respiratory-bg.jpg';
import thyroidBg from '@/assets/thyroid-bg.jpg';
import mentalHealthBg from '@/assets/mental-health-bg.jpg';
import neurologicalBg from '@/assets/neurological-bg.jpg';
import arthritisBg from '@/assets/arthritis-bg.jpg';
import heroMedical from '@/assets/hero-medical.jpg';

export interface Medication {
  name: string;         // Generic name with common brand in parentheses
  category: string;     // Drug class (e.g. "ACE inhibitor")
  dosage: string;       // Typical adult dose form + strength
  frequency: string;    // How often
  timing: string;       // When to take
  notes?: string;       // Important instructions
}

export interface Disease {
  id: string;
  name: string;
  medications: Medication[];
  description: string;
  backgroundImage: string;
  mealPlan: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    night: string[];
  };
  tips: string[];
  emergencySymptoms: string[];
  medicationTimes: string[];
}

export const diseases: Disease[] = [
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    medications: [
      { name: 'Lisinopril (Zestril)', category: 'ACE inhibitor', dosage: '10–40 mg tablet', frequency: 'Once daily', timing: 'Same time every morning', notes: 'Avoid potassium-rich salt substitutes; report persistent dry cough to your doctor.' },
      { name: 'Amlodipine (Norvasc)', category: 'Calcium channel blocker', dosage: '5–10 mg tablet', frequency: 'Once daily', timing: 'Morning, with or without food', notes: 'Ankle swelling is a common side effect — mention if severe.' },
      { name: 'Metoprolol Succinate (Toprol XL)', category: 'Beta-blocker', dosage: '25–200 mg extended-release tablet', frequency: 'Once daily', timing: 'Morning, with food', notes: 'Do not stop suddenly — taper only under doctor supervision.' },
      { name: 'Hydrochlorothiazide (HCTZ)', category: 'Thiazide diuretic', dosage: '12.5–25 mg tablet', frequency: 'Once daily', timing: 'Morning to avoid nighttime urination', notes: 'Drink adequate water; get periodic electrolyte checks.' },
      { name: 'Losartan (Cozaar)', category: 'ARB', dosage: '50–100 mg tablet', frequency: 'Once daily', timing: 'Same time each day', notes: 'Alternative if ACE inhibitors cause cough. Avoid during pregnancy.' },
    ],
    description: 'Chronic condition requiring daily medication to manage blood pressure levels.',
    backgroundImage: heartBg,
    mealPlan: {
      morning: ['Oatmeal with berries', 'Low-sodium whole grain toast', 'Herbal tea', 'Banana'],
      afternoon: ['Grilled chicken salad', 'Brown rice', 'Steamed vegetables', 'Water'],
      evening: ['Baked salmon', 'Quinoa', 'Roasted vegetables', 'Green tea'],
      night: ['Greek yogurt', 'Handful of nuts', 'Chamomile tea']
    },
    tips: ['Limit sodium intake', 'Exercise regularly', 'Maintain healthy weight', 'Manage stress'],
    emergencySymptoms: ['Severe headache', 'Chest pain', 'Difficulty breathing', 'Blurred vision'],
    medicationTimes: ['8:00 AM', '8:00 PM']
  },
  {
    id: 'diabetes',
    name: 'Diabetes (Type 1 & Type 2)',
    medications: [
      { name: 'Metformin (Glucophage)', category: 'Biguanide', dosage: '500–1000 mg tablet', frequency: 'Twice daily', timing: 'With breakfast and dinner', notes: 'Take with food to reduce stomach upset. First-line for Type 2 diabetes.' },
      { name: 'Insulin Glargine (Lantus / Basaglar)', category: 'Long-acting insulin', dosage: '10–50 units subcutaneous', frequency: 'Once daily', timing: 'Same time each evening', notes: 'Rotate injection sites. Store unopened pens in the refrigerator.' },
      { name: 'Empagliflozin (Jardiance)', category: 'SGLT2 inhibitor', dosage: '10–25 mg tablet', frequency: 'Once daily', timing: 'Morning, with or without food', notes: 'Drink plenty of water. May cause frequent urination initially.' },
      { name: 'Semaglutide (Ozempic)', category: 'GLP-1 receptor agonist', dosage: '0.25–2 mg subcutaneous injection', frequency: 'Once weekly', timing: 'Same day each week, any time', notes: 'Nausea is common in the first weeks — starts low and titrates up.' },
      { name: 'Glimepiride (Amaryl)', category: 'Sulfonylurea', dosage: '1–4 mg tablet', frequency: 'Once daily', timing: 'With first main meal (breakfast)', notes: 'Can cause low blood sugar — never skip meals after taking.' },
    ],
    description: 'Metabolic disorder requiring careful blood sugar management and medication.',
    backgroundImage: diabetesBg,
    mealPlan: {
      morning: ['Sugar-free oatmeal', 'Whole grain bread', 'Unsweetened coffee', 'Apple with peanut butter'],
      afternoon: ['Grilled lean protein', 'Brown rice (small portion)', 'Mixed vegetables', 'Water'],
      evening: ['Baked fish', 'Sweet potato', 'Green salad', 'Herbal tea'],
      night: ['Low-fat cheese', 'Handful of almonds', 'Sugar-free beverage']
    },
    tips: ['Monitor blood sugar regularly', 'Count carbohydrates', 'Exercise after meals', 'Stay hydrated'],
    emergencySymptoms: ['Extreme thirst', 'Frequent urination', 'Blurred vision', 'Fatigue'],
    medicationTimes: ['7:00 AM', '12:00 PM', '6:00 PM']
  },
  {
    id: 'asthma',
    name: 'Asthma (Moderate to Severe)',
    medications: [
      { name: 'Fluticasone (Flovent HFA)', category: 'Inhaled corticosteroid', dosage: '44–220 mcg per puff', frequency: 'Twice daily', timing: 'Morning and evening', notes: 'Rinse mouth with water after use to prevent thrush.' },
      { name: 'Salmeterol (Serevent Diskus)', category: 'Long-acting beta agonist (LABA)', dosage: '50 mcg per inhalation', frequency: 'Twice daily (every 12 hours)', timing: 'Morning and evening', notes: 'Never use alone for asthma — always combine with an inhaled steroid.' },
      { name: 'Albuterol (Ventolin / ProAir HFA)', category: 'Short-acting rescue inhaler', dosage: '90 mcg — 2 puffs', frequency: 'As needed for symptoms', timing: 'At onset of wheezing/breathlessness', notes: 'Carry with you at all times. Using >2 times/week means asthma is not controlled — see doctor.' },
      { name: 'Montelukast (Singulair)', category: 'Leukotriene receptor antagonist', dosage: '10 mg tablet', frequency: 'Once daily', timing: 'In the evening', notes: 'Report mood changes or unusual dreams to your doctor.' },
      { name: 'Budesonide/Formoterol (Symbicort)', category: 'ICS + LABA combination inhaler', dosage: '80/4.5 or 160/4.5 mcg — 2 puffs', frequency: 'Twice daily', timing: 'Morning and evening', notes: 'Rinse mouth after each use.' },
    ],
    description: 'Chronic respiratory condition requiring daily controller medications.',
    backgroundImage: respiratoryBg,
    mealPlan: {
      morning: ['Anti-inflammatory smoothie', 'Whole grain cereal', 'Green tea', 'Fresh berries'],
      afternoon: ['Omega-3 rich fish', 'Quinoa', 'Leafy greens', 'Plenty of water'],
      evening: ['Lean chicken breast', 'Brown rice', 'Steamed broccoli', 'Ginger tea'],
      night: ['Warm milk with turmeric', 'Few dates', 'Honey (if not allergic)']
    },
    tips: ['Avoid trigger foods', 'Stay hydrated', 'Practice breathing exercises', 'Keep rescue inhaler nearby'],
    emergencySymptoms: ['Severe breathing difficulty', 'Blue lips or fingernails', 'Chest tightness', 'Cannot speak in full sentences'],
    medicationTimes: ['8:00 AM', '8:00 PM', 'As needed']
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    medications: [
      { name: 'Levothyroxine (Synthroid / Eltroxin)', category: 'Thyroid hormone replacement (T4)', dosage: '25–200 mcg tablet', frequency: 'Once daily', timing: '30–60 minutes before breakfast, empty stomach', notes: 'Take with plain water only. Wait 4 hours before taking calcium, iron, or antacids.' },
      { name: 'Liothyronine (Cytomel)', category: 'Thyroid hormone replacement (T3)', dosage: '5–25 mcg tablet', frequency: 'Once or twice daily', timing: 'Morning on empty stomach', notes: 'Only used in select cases when T4 alone is insufficient — under specialist care.' },
    ],
    description: 'Underactive thyroid requiring daily hormone replacement therapy.',
    backgroundImage: thyroidBg,
    mealPlan: {
      morning: ['Iodine-rich foods', 'Whole grains', 'Brazil nuts', 'Green tea'],
      afternoon: ['Lean protein', 'Seaweed salad', 'Complex carbs', 'Water'],
      evening: ['Turkey or fish', 'Sweet potato', 'Spinach', 'Herbal tea'],
      night: ['Warm almond milk', 'Walnuts', 'Selenium-rich snack']
    },
    tips: ['Take medication on empty stomach', 'Avoid soy products', 'Include selenium-rich foods', 'Regular check-ups'],
    emergencySymptoms: ['Extreme fatigue', 'Swelling in face', 'Slow heart rate', 'Depression'],
    medicationTimes: ['6:00 AM (empty stomach)']
  },
  {
    id: 'depression',
    name: 'Depression / Anxiety',
    medications: [
      { name: 'Sertraline (Zoloft)', category: 'SSRI', dosage: '50–200 mg tablet', frequency: 'Once daily', timing: 'Morning, with food', notes: 'May take 4–6 weeks for full effect. Do not stop abruptly.' },
      { name: 'Escitalopram (Lexapro / Cipralex)', category: 'SSRI', dosage: '10–20 mg tablet', frequency: 'Once daily', timing: 'Morning or evening, consistent time', notes: 'Well-tolerated first-line option. Taper gradually if discontinuing.' },
      { name: 'Fluoxetine (Prozac)', category: 'SSRI', dosage: '20–60 mg capsule', frequency: 'Once daily', timing: 'Morning to avoid insomnia', notes: 'Long half-life — missed doses less critical. Avoid MAOIs.' },
      { name: 'Venlafaxine (Effexor XR)', category: 'SNRI', dosage: '37.5–225 mg extended-release capsule', frequency: 'Once daily', timing: 'Same time daily, with food', notes: 'Can raise blood pressure — monitor regularly.' },
      { name: 'Bupropion (Wellbutrin XL)', category: 'Atypical antidepressant', dosage: '150–300 mg extended-release', frequency: 'Once daily', timing: 'Morning', notes: 'Avoid if history of seizures or eating disorders.' },
    ],
    description: 'Mental health condition requiring consistent medication and lifestyle support.',
    backgroundImage: mentalHealthBg,
    mealPlan: {
      morning: ['Omega-3 rich breakfast', 'Whole grains', 'Mood-boosting smoothie', 'Green tea'],
      afternoon: ['Lean protein', 'Complex carbohydrates', 'Colorful vegetables', 'Water'],
      evening: ['Salmon or tuna', 'Quinoa', 'Dark leafy greens', 'Chamomile tea'],
      night: ['Magnesium-rich snack', 'Dark chocolate (small piece)', 'Calming tea']
    },
    tips: ['Maintain regular meal times', 'Include omega-3 foods', 'Limit caffeine', 'Practice mindfulness'],
    emergencySymptoms: ['Suicidal thoughts', 'Severe mood changes', 'Panic attacks', 'Social withdrawal'],
    medicationTimes: ['9:00 AM', '9:00 PM']
  },
  {
    id: 'copd',
    name: 'COPD (Chronic Obstructive Pulmonary Disease)',
    medications: [
      { name: 'Tiotropium (Spiriva HandiHaler / Respimat)', category: 'Long-acting anticholinergic (LAMA)', dosage: '18 mcg capsule or 2.5 mcg spray — 2 puffs', frequency: 'Once daily', timing: 'Same time each morning', notes: 'Do not swallow the capsule — it is for inhalation only.' },
      { name: 'Salmeterol / Fluticasone (Advair Diskus)', category: 'LABA + ICS combination', dosage: '250/50 or 500/50 mcg — 1 inhalation', frequency: 'Twice daily (every 12 hours)', timing: 'Morning and evening', notes: 'Rinse mouth after use to prevent thrush.' },
      { name: 'Ipratropium / Albuterol (Combivent Respimat)', category: 'Short-acting bronchodilator combo', dosage: '20/100 mcg — 1 puff', frequency: 'Up to 4 times daily', timing: 'As symptoms occur', notes: 'For flare-ups. Do not exceed 6 puffs in 24 hours.' },
      { name: 'Roflumilast (Daliresp)', category: 'PDE-4 inhibitor', dosage: '500 mcg tablet', frequency: 'Once daily', timing: 'Same time daily, with or without food', notes: 'For severe COPD with chronic bronchitis. Report weight loss or mood changes.' },
      { name: 'Prednisone', category: 'Oral corticosteroid (short course)', dosage: '20–40 mg tablet', frequency: 'Once daily', timing: 'Morning with food', notes: 'Only during exacerbations — typically 5–7 days. Do not stop mid-course.' },
    ],
    description: 'Progressive lung disease requiring daily respiratory medications and monitoring.',
    backgroundImage: respiratoryBg,
    mealPlan: {
      morning: ['High-protein smoothie', 'Fortified cereals', 'Fresh fruits', 'Green tea'],
      afternoon: ['Lean meats', 'Whole grains', 'Antioxidant-rich vegetables', 'Water'],
      evening: ['Fish high in omega-3', 'Quinoa', 'Colorful vegetables', 'Herbal tea'],
      night: ['Protein-rich snack', 'Nuts', 'Warm beverage']
    },
    tips: ['Avoid smoking', 'Practice breathing exercises', 'Stay active', 'Prevent infections'],
    emergencySymptoms: ['Severe shortness of breath', 'Blue fingernails', 'Chest pain', 'Confusion'],
    medicationTimes: ['8:00 AM', '2:00 PM', '8:00 PM']
  },
  {
    id: 'epilepsy',
    name: 'Epilepsy',
    medications: [
      { name: 'Levetiracetam (Keppra)', category: 'Antiepileptic (AED)', dosage: '500–1500 mg tablet', frequency: 'Twice daily (every 12 hours)', timing: 'Morning and evening', notes: 'Take at consistent times. Report unusual mood changes.' },
      { name: 'Lamotrigine (Lamictal)', category: 'Antiepileptic (AED)', dosage: '25–200 mg tablet', frequency: 'Twice daily', timing: 'Morning and evening', notes: 'Report any skin rash immediately — can be serious.' },
      { name: 'Valproate / Divalproex (Depakote)', category: 'Antiepileptic (AED)', dosage: '250–500 mg delayed-release tablet', frequency: '2–3 times daily', timing: 'With meals to reduce nausea', notes: 'Avoid in pregnancy. Periodic liver function tests required.' },
      { name: 'Carbamazepine (Tegretol)', category: 'Antiepileptic (AED)', dosage: '200–400 mg tablet', frequency: '2–3 times daily', timing: 'With food', notes: 'Regular blood monitoring needed. Many drug interactions.' },
      { name: 'Phenytoin (Dilantin)', category: 'Antiepileptic (AED)', dosage: '100 mg capsule', frequency: '3 times daily', timing: 'With meals', notes: 'Requires periodic blood level checks. Practice good oral hygiene — can affect gums.' },
    ],
    description: 'Neurological disorder requiring daily medication to prevent seizures.',
    backgroundImage: neurologicalBg,
    mealPlan: {
      morning: ['Balanced breakfast', 'Complex carbohydrates', 'Protein sources', 'Vitamin B-rich foods'],
      afternoon: ['Lean protein', 'Whole grains', 'Fresh vegetables', 'Water'],
      evening: ['Fish or poultry', 'Brown rice', 'Green vegetables', 'Herbal tea'],
      night: ['Light protein snack', 'Calcium-rich foods', 'Relaxing beverage']
    },
    tips: ['Take medication consistently', 'Get adequate sleep', 'Avoid triggers', 'Wear medical ID'],
    emergencySymptoms: ['Prolonged seizure', 'Multiple seizures', 'Difficulty breathing', 'Head injury during seizure'],
    medicationTimes: ['8:00 AM', '8:00 PM']
  },
  {
    id: 'rheumatoid-arthritis',
    name: 'Rheumatoid Arthritis',
    medications: [
      { name: 'Methotrexate (Trexall / Rheumatrex)', category: 'DMARD (first-line)', dosage: '7.5–25 mg tablet or injection', frequency: 'Once weekly', timing: 'Same day each week', notes: 'Take folic acid 1 mg daily to reduce side effects. Avoid alcohol.' },
      { name: 'Hydroxychloroquine (Plaquenil)', category: 'DMARD', dosage: '200–400 mg tablet', frequency: 'Once or twice daily', timing: 'With food', notes: 'Annual eye exams required to monitor for retinal changes.' },
      { name: 'Sulfasalazine (Azulfidine)', category: 'DMARD', dosage: '500–1000 mg tablet', frequency: 'Twice daily', timing: 'With food and full glass of water', notes: 'May turn urine orange-yellow — harmless.' },
      { name: 'Etanercept (Enbrel)', category: 'Biologic (TNF inhibitor)', dosage: '50 mg subcutaneous injection', frequency: 'Once weekly', timing: 'Same day each week', notes: 'Store in refrigerator. Watch for signs of infection.' },
      { name: 'Adalimumab (Humira)', category: 'Biologic (TNF inhibitor)', dosage: '40 mg subcutaneous injection', frequency: 'Every 2 weeks', timing: 'Same day of the week', notes: 'Rotate injection sites. Avoid live vaccines while on treatment.' },
      { name: 'Prednisone', category: 'Corticosteroid (short-term)', dosage: '5–20 mg tablet', frequency: 'Once daily', timing: 'Morning with food', notes: 'Never stop suddenly. Long-term use requires calcium + vitamin D.' },
    ],
    description: 'Autoimmune condition requiring medication to control inflammation and joint damage.',
    backgroundImage: arthritisBg,
    mealPlan: {
      morning: ['Anti-inflammatory foods', 'Omega-3 rich breakfast', 'Turmeric tea', 'Fresh berries'],
      afternoon: ['Fatty fish', 'Olive oil', 'Leafy greens', 'Water'],
      evening: ['Anti-inflammatory dinner', 'Nuts and seeds', 'Colorful vegetables', 'Green tea'],
      night: ['Tart cherry juice', 'Walnuts', 'Herbal tea']
    },
    tips: ['Follow anti-inflammatory diet', 'Gentle exercise', 'Manage stress', 'Regular check-ups'],
    emergencySymptoms: ['Severe joint swelling', 'High fever', 'Extreme fatigue', 'Signs of infection'],
    medicationTimes: ['9:00 AM', '6:00 PM']
  },
  {
    id: 'parkinsons',
    name: "Parkinson's Disease",
    medications: [
      { name: 'Levodopa / Carbidopa (Sinemet)', category: 'Dopamine precursor combination', dosage: '25/100 mg tablet', frequency: '3–4 times daily', timing: '30 minutes before meals', notes: 'Avoid high-protein meals close to dose — can reduce absorption.' },
      { name: 'Pramipexole (Mirapex)', category: 'Dopamine agonist', dosage: '0.125–1.5 mg tablet', frequency: '3 times daily', timing: 'With or without food, consistent schedule', notes: 'Report any sudden sleep episodes or impulsive behavior.' },
      { name: 'Ropinirole (Requip)', category: 'Dopamine agonist', dosage: '0.25–8 mg tablet', frequency: '3 times daily (or once for XL)', timing: 'With food to reduce nausea', notes: 'Taper slowly if stopping.' },
      { name: 'Rasagiline (Azilect)', category: 'MAO-B inhibitor', dosage: '0.5–1 mg tablet', frequency: 'Once daily', timing: 'Morning', notes: 'Avoid tyramine-rich foods (aged cheese, cured meats) and certain antidepressants.' },
      { name: 'Entacapone (Comtan)', category: 'COMT inhibitor', dosage: '200 mg tablet', frequency: 'With each Levodopa dose', timing: 'Same time as Levodopa/Carbidopa', notes: 'May turn urine brownish — harmless.' },
    ],
    description: 'Progressive neurological disorder requiring medication to manage movement symptoms.',
    backgroundImage: neurologicalBg,
    mealPlan: {
      morning: ['High-fiber foods', 'Protein-rich breakfast', 'Antioxidant fruits', 'Green tea'],
      afternoon: ['Lean protein', 'Complex carbs', 'Colorful vegetables', 'Water'],
      evening: ['Fish or lean meat', 'Whole grains', 'Fiber-rich vegetables', 'Herbal tea'],
      night: ['Light protein snack', 'Calcium sources', 'Calming beverage']
    },
    tips: ['Take medication on time', 'Stay physically active', 'Speech therapy', 'Social engagement'],
    emergencySymptoms: ['Severe freezing episodes', 'Difficulty swallowing', 'Balance problems', 'Confusion'],
    medicationTimes: ['7:00 AM', '12:00 PM', '5:00 PM', '10:00 PM']
  },
  {
    id: 'heart-failure',
    name: 'Heart Failure',
    medications: [
      { name: 'Lisinopril (Zestril)', category: 'ACE inhibitor', dosage: '5–40 mg tablet', frequency: 'Once daily', timing: 'Same time each morning', notes: 'Monitor kidney function and potassium regularly.' },
      { name: 'Metoprolol Succinate (Toprol XL)', category: 'Beta-blocker', dosage: '25–200 mg extended-release tablet', frequency: 'Once daily', timing: 'Morning with food', notes: 'Start low, titrate up slowly. Do not stop abruptly.' },
      { name: 'Spironolactone (Aldactone)', category: 'Aldosterone antagonist', dosage: '25–50 mg tablet', frequency: 'Once daily', timing: 'Morning with food', notes: 'Watch for high potassium. Avoid potassium supplements unless prescribed.' },
      { name: 'Furosemide (Lasix)', category: 'Loop diuretic', dosage: '20–80 mg tablet', frequency: 'Once or twice daily', timing: 'Morning (and early afternoon if twice)', notes: 'Weigh daily; report >2 kg gain in 2 days. Take last dose before 4 PM to avoid nocturia.' },
      { name: 'Sacubitril / Valsartan (Entresto)', category: 'ARNI', dosage: '24/26 to 97/103 mg tablet', frequency: 'Twice daily', timing: 'Morning and evening, with or without food', notes: 'Stop ACE inhibitor at least 36 hours before starting.' },
    ],
    description: 'Condition where the heart cannot pump blood effectively, requiring careful medication management.',
    backgroundImage: heartBg,
    mealPlan: {
      morning: ['Low-sodium breakfast', 'Heart-healthy grains', 'Fresh fruits', 'Herbal tea'],
      afternoon: ['Lean protein', 'Low-sodium options', 'Vegetables', 'Controlled fluids'],
      evening: ['Heart-healthy fish', 'Quinoa', 'Steamed vegetables', 'Limited fluids'],
      night: ['Light snack', 'Low-sodium options', 'Herbal tea']
    },
    tips: ['Monitor fluid intake', 'Limit sodium', 'Daily weight checks', 'Regular exercise'],
    emergencySymptoms: ['Severe shortness of breath', 'Sudden weight gain', 'Chest pain', 'Swelling in legs'],
    medicationTimes: ['8:00 AM', '2:00 PM', '8:00 PM']
  },
  {
    id: 'bipolar',
    name: 'Bipolar Disorder',
    medications: [
      { name: 'Lithium Carbonate (Lithobid / Eskalith)', category: 'Mood stabilizer', dosage: '300–1200 mg tablet', frequency: '2–3 times daily', timing: 'With food and full glass of water', notes: 'Regular blood level monitoring required. Stay well hydrated; avoid large caffeine changes.' },
      { name: 'Valproate / Divalproex (Depakote)', category: 'Mood stabilizer / anticonvulsant', dosage: '250–500 mg delayed-release tablet', frequency: '2–3 times daily', timing: 'With meals', notes: 'Periodic liver function and blood count checks. Avoid in pregnancy.' },
      { name: 'Quetiapine (Seroquel)', category: 'Atypical antipsychotic', dosage: '100–800 mg tablet', frequency: 'Once daily (extended-release) or divided', timing: 'Evening — often causes drowsiness', notes: 'Monitor weight and blood sugar over time.' },
      { name: 'Lamotrigine (Lamictal)', category: 'Mood stabilizer / anticonvulsant', dosage: '25–200 mg tablet', frequency: 'Once or twice daily', timing: 'Consistent daily time', notes: 'Report any skin rash immediately. Dose must be titrated slowly.' },
      { name: 'Aripiprazole (Abilify)', category: 'Atypical antipsychotic', dosage: '10–30 mg tablet', frequency: 'Once daily', timing: 'Morning', notes: 'Report restlessness or unusual urges to your doctor.' },
    ],
    description: 'Mental health condition requiring medication to stabilize mood episodes.',
    backgroundImage: mentalHealthBg,
    mealPlan: {
      morning: ['Stable blood sugar foods', 'Complex carbs', 'Protein sources', 'Omega-3 rich foods'],
      afternoon: ['Balanced protein', 'Whole grains', 'Mood-supporting nutrients', 'Water'],
      evening: ['Brain-healthy dinner', 'Anti-inflammatory foods', 'Calming herbs', 'Herbal tea'],
      night: ['Sleep-promoting snack', 'Magnesium-rich foods', 'Relaxing beverage']
    },
    tips: ['Maintain sleep schedule', 'Monitor mood changes', 'Avoid alcohol', 'Regular therapy'],
    emergencySymptoms: ['Severe mood swings', 'Suicidal thoughts', 'Manic episodes', 'Psychotic symptoms'],
    medicationTimes: ['9:00 AM', '9:00 PM']
  },
  {
    id: 'gerd',
    name: 'GERD (Gastroesophageal Reflux Disease)',
    medications: [
      { name: 'Omeprazole (Prilosec)', category: 'Proton pump inhibitor (PPI)', dosage: '20–40 mg capsule', frequency: 'Once daily', timing: '30–60 minutes before breakfast', notes: 'Swallow whole. Long-term use may need periodic review with your doctor.' },
      { name: 'Pantoprazole (Protonix)', category: 'Proton pump inhibitor (PPI)', dosage: '40 mg tablet', frequency: 'Once daily', timing: '30 minutes before breakfast', notes: 'Do not crush or chew the tablet.' },
      { name: 'Esomeprazole (Nexium)', category: 'Proton pump inhibitor (PPI)', dosage: '20–40 mg capsule', frequency: 'Once daily', timing: '1 hour before a meal', notes: 'Can be opened and sprinkled on applesauce if swallowing is hard.' },
      { name: 'Famotidine (Pepcid)', category: 'H2 blocker', dosage: '20–40 mg tablet', frequency: 'Once or twice daily', timing: 'Before bedtime and/or before meals', notes: 'Good for nighttime symptoms. Works within 1 hour.' },
      { name: 'Calcium Carbonate (Tums / Gaviscon)', category: 'Antacid', dosage: '500–1000 mg chewable', frequency: 'As needed', timing: 'When symptoms occur, after meals', notes: 'For quick, occasional relief only — not for daily long-term use.' },
    ],
    description: 'Chronic digestive condition requiring medication to reduce stomach acid production.',
    backgroundImage: heroMedical,
    mealPlan: {
      morning: ['Low-acid foods', 'Oatmeal', 'Non-citrus fruits', 'Herbal tea'],
      afternoon: ['Lean proteins', 'Non-spicy foods', 'Alkaline vegetables', 'Water'],
      evening: ['Early dinner', 'Small portions', 'Low-fat options', 'Ginger tea'],
      night: ['Light snack (if needed)', 'Alkaline foods', 'Chamomile tea']
    },
    tips: ['Eat smaller meals', 'Avoid spicy foods', 'Sleep elevated', 'Avoid late eating'],
    emergencySymptoms: ['Severe chest pain', 'Difficulty swallowing', 'Persistent vomiting', 'Blood in vomit'],
    medicationTimes: ['30 minutes before breakfast', '30 minutes before dinner']
  },
  {
    id: 'kidney-disease',
    name: 'Chronic Kidney Disease',
    medications: [
      { name: 'Losartan (Cozaar)', category: 'ARB (kidney protection)', dosage: '50–100 mg tablet', frequency: 'Once daily', timing: 'Same time each day', notes: 'Protects kidney function. Regular potassium and creatinine checks needed.' },
      { name: 'Sevelamer (Renvela)', category: 'Phosphate binder', dosage: '800 mg tablet', frequency: '3 times daily', timing: 'With each meal', notes: 'Take with meals to bind dietary phosphate. Do not take other medicines within 1 hour.' },
      { name: 'Calcitriol (Rocaltrol)', category: 'Active vitamin D', dosage: '0.25–0.5 mcg capsule', frequency: 'Once daily', timing: 'Same time each day', notes: 'Blood calcium checks required. Watch for signs of high calcium.' },
      { name: 'Ferrous Sulfate', category: 'Iron supplement', dosage: '325 mg tablet', frequency: 'Once or twice daily', timing: 'On empty stomach if tolerated, otherwise with food', notes: 'May cause dark stools and constipation. Take with vitamin C for better absorption.' },
      { name: 'Erythropoietin (Epogen / Procrit)', category: 'Erythropoiesis-stimulating agent', dosage: 'Individualized subcutaneous injection', frequency: '1–3 times weekly', timing: 'As scheduled by nephrologist', notes: 'For CKD-related anemia. Blood pressure and hemoglobin monitored closely.' },
      { name: 'Sodium Bicarbonate', category: 'Alkalizing agent', dosage: '650 mg tablet', frequency: '2–3 times daily', timing: 'With meals', notes: 'Corrects metabolic acidosis. Report swelling.' },
    ],
    description: 'Progressive kidney condition requiring medication and dietary management.',
    backgroundImage: heroMedical,
    mealPlan: {
      morning: ['Low-protein breakfast', 'Controlled phosphorus', 'Limited potassium', 'Filtered water'],
      afternoon: ['Kidney-friendly protein', 'Low-sodium options', 'Controlled portions', 'Limited fluids'],
      evening: ['Plant-based proteins', 'Low-phosphorus foods', 'Heart-healthy options', 'Herbal tea'],
      night: ['Light snack', 'Kidney-safe foods', 'Limited fluids']
    },
    tips: ['Monitor protein intake', 'Control blood pressure', 'Limit phosphorus', 'Regular lab tests'],
    emergencySymptoms: ['Severe swelling', 'Difficulty breathing', 'Chest pain', 'Confusion'],
    medicationTimes: ['8:00 AM', '6:00 PM']
  },
  {
    id: 'hyperthyroidism',
    name: 'Hyperthyroidism',
    medications: [
      { name: 'Methimazole (Tapazole)', category: 'Antithyroid drug', dosage: '5–20 mg tablet', frequency: '1–3 times daily', timing: 'Consistent time each day', notes: 'Report sore throat, fever, or unusual bruising immediately.' },
      { name: 'Propylthiouracil (PTU)', category: 'Antithyroid drug', dosage: '50–150 mg tablet', frequency: '3 times daily (every 8 hours)', timing: 'Consistent times', notes: 'Preferred in first trimester of pregnancy. Liver function monitoring required.' },
      { name: 'Propranolol (Inderal)', category: 'Beta-blocker (symptom control)', dosage: '10–40 mg tablet', frequency: '3–4 times daily', timing: 'Same times each day', notes: 'Controls rapid heartbeat, tremor and anxiety while thyroid meds take effect.' },
      { name: 'Atenolol (Tenormin)', category: 'Beta-blocker (symptom control)', dosage: '25–100 mg tablet', frequency: 'Once daily', timing: 'Morning', notes: 'Longer-acting alternative to propranolol.' },
    ],
    description: 'Overactive thyroid condition requiring medication to reduce hormone production.',
    backgroundImage: thyroidBg,
    mealPlan: {
      morning: ['High-calorie breakfast', 'Calcium-rich foods', 'Protein sources', 'Green tea'],
      afternoon: ['Nutritious meals', 'Vitamin D foods', 'Healthy fats', 'Water'],
      evening: ['Balanced dinner', 'Anti-inflammatory foods', 'Calcium sources', 'Herbal tea'],
      night: ['Protein snack', 'Calming foods', 'Relaxing beverage']
    },
    tips: ['Regular medication', 'Monitor heart rate', 'Avoid iodine excess', 'Manage stress'],
    emergencySymptoms: ['Rapid heart rate', 'High fever', 'Severe sweating', 'Confusion'],
    medicationTimes: ['8:00 AM', '8:00 PM']
  },
  {
    id: 'high-cholesterol',
    name: 'High Cholesterol',
    medications: [
      { name: 'Atorvastatin (Lipitor)', category: 'Statin', dosage: '10–80 mg tablet', frequency: 'Once daily', timing: 'Any time of day, consistent time', notes: 'Report muscle pain or weakness. Avoid grapefruit juice.' },
      { name: 'Rosuvastatin (Crestor)', category: 'Statin', dosage: '5–40 mg tablet', frequency: 'Once daily', timing: 'Any time, with or without food', notes: 'Space away from antacids by at least 2 hours.' },
      { name: 'Simvastatin (Zocor)', category: 'Statin', dosage: '10–40 mg tablet', frequency: 'Once daily', timing: 'Evening (works best at night)', notes: 'Avoid grapefruit. Report muscle soreness.' },
      { name: 'Ezetimibe (Zetia)', category: 'Cholesterol absorption inhibitor', dosage: '10 mg tablet', frequency: 'Once daily', timing: 'Same time each day, with or without food', notes: 'Often added on top of a statin for extra LDL reduction.' },
      { name: 'Fenofibrate (Tricor)', category: 'Fibrate', dosage: '48–145 mg tablet', frequency: 'Once daily', timing: 'With meals', notes: 'Primarily used when triglycerides are high.' },
      { name: 'Evolocumab (Repatha)', category: 'PCSK9 inhibitor', dosage: '140 mg subcutaneous injection', frequency: 'Every 2 weeks (or 420 mg monthly)', timing: 'Same day of the cycle', notes: 'For very high cholesterol or when statins are not enough / tolerated.' },
    ],
    description: 'Lipid disorder requiring medication to lower cholesterol levels and prevent heart disease.',
    backgroundImage: heartBg,
    mealPlan: {
      morning: ['Heart-healthy breakfast', 'Oats', 'Berries', 'Green tea'],
      afternoon: ['Lean proteins', 'Fiber-rich foods', 'Healthy fats', 'Water'],
      evening: ['Fish rich in omega-3', 'Whole grains', 'Vegetables', 'Herbal tea'],
      night: ['Nuts (small portion)', 'Plant-based snack', 'Chamomile tea']
    },
    tips: ['Follow heart-healthy diet', 'Regular exercise', 'Limit saturated fats', 'Quit smoking'],
    emergencySymptoms: ['Chest pain', 'Shortness of breath', 'Heart palpitations', 'Dizziness'],
    medicationTimes: ['Evening with dinner']
  }
];

export const getAllDiseases = () => diseases;
export const getDiseaseById = (id: string) => diseases.find(d => d.id === id);