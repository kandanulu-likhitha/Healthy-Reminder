import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Smile, Meh, Frown, CloudRain, Sun,
  Droplets, Dumbbell, Moon, Brain,
  AlertCircle, Lightbulb, Calendar,
  ChevronLeft, ChevronRight, Save, Sparkles
} from 'lucide-react';
import { format, subDays, addDays, isToday } from 'date-fns';

const MOODS = [
  { value: 'great', label: 'Great', icon: Sun, color: 'text-success' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-primary' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-warning' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'text-destructive' },
  { value: 'terrible', label: 'Terrible', icon: CloudRain, color: 'text-destructive' },
];

const COMMON_SYMPTOMS = [
  'Headache', 'Fatigue', 'Nausea', 'Dizziness', 'Joint Pain',
  'Chest Tightness', 'Shortness of Breath', 'High Blood Sugar',
  'Low Blood Sugar', 'Swelling', 'Blurred Vision', 'Palpitations',
  'Insomnia', 'Anxiety', 'Loss of Appetite'
];

const DailyLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState('okay');
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [sleepHours, setSleepHours] = useState([7]);
  const [waterIntake, setWaterIntake] = useState([4]);
  const [exerciseMinutes, setExerciseMinutes] = useState([0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [problems, setProblems] = useState('');
  const [activities, setActivities] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [existingLogId, setExistingLogId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/auth');
  }, [navigate]);

  const fetchLog = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('patient_id', user.id)
      .eq('log_date', dateStr)
      .maybeSingle();

    if (data) {
      setExistingLogId(data.id);
      setMood(data.mood || 'okay');
      setEnergyLevel([data.energy_level || 5]);
      setSleepHours([data.sleep_hours || 7]);
      setWaterIntake([data.water_intake || 0]);
      setExerciseMinutes([data.exercise_minutes || 0]);
      setSelectedSymptoms(data.symptoms || []);
      setProblems(data.problems || '');
      setActivities(data.activities || '');
      setAiSuggestion(data.ai_suggestion || '');
    } else {
      resetForm();
    }
  }, [selectedDate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const resetForm = () => {
    setExistingLogId(null);
    setMood('okay');
    setEnergyLevel([5]);
    setSleepHours([7]);
    setWaterIntake([4]);
    setExerciseMinutes([0]);
    setSelectedSymptoms([]);
    setProblems('');
    setActivities('');
    setAiSuggestion('');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const generateSuggestion = () => {
    setGenerating(true);
    // Generate smart suggestions based on logged data
    const suggestions: string[] = [];

    if (mood === 'bad' || mood === 'terrible') {
      suggestions.push("🧘 Try deep breathing exercises for 5 minutes to help calm your mind.");
    }
    if (sleepHours[0] < 6) {
      suggestions.push("😴 You need more sleep! Aim for 7-8 hours. Try avoiding screens 1 hour before bed.");
    }
    if (waterIntake[0] < 6) {
      suggestions.push(`💧 You've had ${waterIntake[0]} glasses of water. Aim for at least 8 glasses daily.`);
    }
    if (exerciseMinutes[0] === 0) {
      suggestions.push("🚶 Even a 15-minute walk can improve your health! Try to include some light exercise today.");
    }
    if (selectedSymptoms.includes('Headache')) {
      suggestions.push("🤕 For headaches: Stay hydrated, rest in a dark room, and consider reducing screen time.");
    }
    if (selectedSymptoms.includes('High Blood Sugar')) {
      suggestions.push("🩸 High blood sugar detected! Avoid sugary foods, eat fiber-rich meals, and consult your doctor if persistent.");
    }
    if (selectedSymptoms.includes('Fatigue')) {
      suggestions.push("⚡ Feeling fatigued? Check your iron intake, take short breaks, and ensure you're eating balanced meals.");
    }
    if (selectedSymptoms.includes('Joint Pain')) {
      suggestions.push("🦴 For joint pain: Apply warm compress, do gentle stretching, and consider anti-inflammatory foods like turmeric.");
    }
    if (selectedSymptoms.includes('Anxiety')) {
      suggestions.push("🌿 For anxiety: Practice box breathing (4-4-4-4), limit caffeine, and try journaling your thoughts.");
    }
    if (selectedSymptoms.includes('Insomnia')) {
      suggestions.push("🌙 For better sleep: Maintain a fixed schedule, avoid heavy meals at night, and try chamomile tea.");
    }
    if (energyLevel[0] <= 3) {
      suggestions.push("🔋 Low energy? Eat iron-rich foods, stay hydrated, and take a 20-minute power nap if possible.");
    }

    if (suggestions.length === 0) {
      suggestions.push("✅ You're doing well today! Keep maintaining your healthy routine. Remember to take your medications on time.");
    }

    if (problems) {
      suggestions.push(`📋 Regarding your concerns: Please discuss "${problems.substring(0, 50)}..." with your doctor at your next visit.`);
    }

    const fullSuggestion = suggestions.join('\n\n');
    setAiSuggestion(fullSuggestion);
    setGenerating(false);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const logData = {
      patient_id: user.id,
      log_date: dateStr,
      mood,
      energy_level: energyLevel[0],
      sleep_hours: sleepHours[0],
      water_intake: waterIntake[0],
      exercise_minutes: exerciseMinutes[0],
      symptoms: selectedSymptoms,
      problems,
      activities,
      ai_suggestion: aiSuggestion,
    };

    let error;
    if (existingLogId) {
      ({ error } = await supabase.from('daily_logs').update(logData).eq('id', existingLogId));
    } else {
      ({ error } = await supabase.from('daily_logs').insert(logData));
    }

    if (error) {
      toast({ title: "Error", description: "Failed to save daily log", variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: "Your daily log has been saved successfully." });
      fetchLog();
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          Daily Health Journal
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your daily activities, symptoms & get personalized health suggestions
        </p>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">{format(selectedDate, 'EEEE, MMM d, yyyy')}</span>
          {isToday(selectedDate) && <Badge>Today</Badge>}
        </div>
        <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))} disabled={isToday(selectedDate)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood */}
        <Card>
          <CardHeader><CardTitle className="text-lg">How are you feeling?</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => {
                const Icon = m.icon;
                return (
                  <Button
                    key={m.value}
                    variant={mood === m.value ? 'default' : 'outline'}
                    className="flex-1 min-w-[70px] flex-col gap-1 h-auto py-3"
                    onClick={() => setMood(m.value)}
                  >
                    <Icon className={`w-6 h-6 ${mood === m.value ? '' : m.color}`} />
                    <span className="text-xs">{m.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Energy Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Energy Level
              <Badge variant="secondary">{energyLevel[0]}/10</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider value={energyLevel} onValueChange={setEnergyLevel} max={10} min={1} step={1} className="mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Very Low</span><span>Moderate</span><span>High Energy</span>
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" /> Sleep Hours
              <Badge variant="secondary" className="ml-auto">{sleepHours[0]}h</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider value={sleepHours} onValueChange={setSleepHours} max={12} min={0} step={0.5} className="mt-2" />
          </CardContent>
        </Card>

        {/* Water Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" /> Water Intake
              <Badge variant="secondary" className="ml-auto">{waterIntake[0]} glasses</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider value={waterIntake} onValueChange={setWaterIntake} max={15} min={0} step={1} className="mt-2" />
          </CardContent>
        </Card>

        {/* Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" /> Exercise
              <Badge variant="secondary" className="ml-auto">{exerciseMinutes[0]} min</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider value={exerciseMinutes} onValueChange={setExerciseMinutes} max={120} min={0} step={5} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Symptoms You're Experiencing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(symptom => (
              <Badge
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3 hover:shadow-sm transition-all"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Problems & Activities */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Problems / Concerns</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe any health problems or concerns you're facing today..."
              value={problems}
              onChange={e => setProblems(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Today's Activities</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="What did you do today? Walks, cooking, work, rest..."
              value={activities}
              onChange={e => setActivities(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Health Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateSuggestion} disabled={generating} className="gap-2 w-full md:w-auto">
            <Lightbulb className="w-4 h-4" />
            {generating ? 'Analyzing...' : 'Get Personalized Suggestions'}
          </Button>
          {aiSuggestion && (
            <div className="p-4 bg-card rounded-lg border whitespace-pre-line text-sm leading-relaxed">
              {aiSuggestion}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pb-8">
        <Button size="lg" onClick={handleSave} disabled={loading} className="gap-2 px-12 text-lg">
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : existingLogId ? 'Update Daily Log' : 'Save Daily Log'}
        </Button>
      </div>

      {/* Medical Disclaimer */}
      <p className="text-xs text-center text-muted-foreground pb-4">
        ⚠️ This platform does not replace professional medical advice. Always consult your doctor for medical decisions.
      </p>
    </div>
  );
};

export default DailyLog;
