import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getDiseaseById, getAllDiseases } from '@/data/diseases';
import { Clock, Bell, Trash2, Volume2, CheckCircle, Loader2, StopCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Reminder {
  id: string;
  disease_id: string;
  disease_name: string;
  medication_name: string;
  reminder_time: string;
  frequency: string;
  ringtone: string | null;
  is_active: boolean;
}

const RINGTONE_OPTIONS: { value: string; label: string; type: 'beep' | 'chime' | 'nature' | 'music' | 'custom' }[] = [
  { value: 'default', label: '🔔 Default Beep', type: 'beep' },
  { value: 'gentle', label: '🎵 Gentle Bell', type: 'chime' },
  { value: 'chime', label: '🎐 Wind Chime', type: 'chime' },
  { value: 'nature', label: '🌿 Nature Sounds', type: 'nature' },
  { value: 'music', label: '🎶 Calm Music', type: 'music' },
  { value: 'custom', label: '⬆️ My Uploaded Tone', type: 'custom' },
];

// Web-Audio generated tones for the built-in ringtones (no external files needed)
let audioCtx: AudioContext | null = null;
const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
};
let stopFn: (() => void) | null = null;

const playTone = (kind: string): (() => void) => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  const patterns: Record<string, { freqs: number[]; interval: number; dur: number; type: OscillatorType }> = {
    default: { freqs: [880, 660], interval: 0.5, dur: 0.25, type: 'square' },
    gentle:  { freqs: [523, 659, 784], interval: 0.7, dur: 0.6, type: 'sine' },
    chime:   { freqs: [1047, 1319, 1568, 2093], interval: 0.45, dur: 0.8, type: 'triangle' },
    nature:  { freqs: [392, 440, 494], interval: 1.0, dur: 0.9, type: 'sine' },
    music:   { freqs: [523, 587, 659, 698, 784, 880], interval: 0.4, dur: 0.35, type: 'sine' },
  };
  const p = patterns[kind] || patterns.default;
  let i = 0;
  const timer = setInterval(() => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = p.freqs[i % p.freqs.length];
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.dur);
    osc.connect(g); g.connect(master);
    osc.start(); osc.stop(ctx.currentTime + p.dur);
    i++;
  }, p.interval * 1000);

  return () => { clearInterval(timer); try { master.disconnect(); } catch {} };
};

const playAudioSrc = (src: string): (() => void) => {
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.7;
  audio.play().catch(() => {});
  return () => { audio.pause(); audio.src = ''; };
};

const startRinging = (ringtone: string | null, reminderId: string) => {
  stopRinging();
  const key = ringtone || 'default';
  const opt = RINGTONE_OPTIONS.find(o => o.value === key);
  if (opt?.type === 'custom') {
    const src = localStorage.getItem(`reminder_audio_${reminderId}`);
    if (src) { stopFn = playAudioSrc(src); return; }
  }
  stopFn = playTone(key);
};
const stopRinging = () => { if (stopFn) { stopFn(); stopFn = null; } };

const Reminders = () => {
  const { user, loading: authLoading } = useAuth(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [ringing, setRinging] = useState<Reminder | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const customFileRef = useRef<HTMLInputElement>(null);
  const [customAudioData, setCustomAudioData] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    diseaseId: searchParams.get('disease') || '',
    medicationName: '',
    time: '',
    frequency: 'daily',
    ringtone: 'default'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('disease')) {
      setIsCreating(true);
    }
  }, [searchParams]);

  // Alarm scheduler: check every 20s for reminders whose time matches now (HH:MM), fire once per day
  useEffect(() => {
    if (!reminders.length) return;
    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dayKey = now.toISOString().slice(0, 10);
      reminders.forEach(r => {
        if (!r.is_active) return;
        const rtime = r.reminder_time.slice(0, 5);
        const fireKey = `${r.id}_${dayKey}_${rtime}`;
        if (rtime === hhmm && !firedRef.current.has(fireKey)) {
          firedRef.current.add(fireKey);
          startRinging(r.ringtone, r.id);
          setRinging(r);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💊 Medication reminder', { body: `Time to take ${r.medication_name}` });
          }
        }
      });
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, [reminders]);

  useEffect(() => () => stopRinging(), []);

  const dismissAlarm = () => {
    stopRinging();
    toast({ title: '✅ Good job!', description: 'Task completed. Thanks for choosing Healthy Reminder 🌿' });
    setRinging(null);
  };

  const onCustomFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCustomAudioData(reader.result as string);
      setFormData(f => ({ ...f, ringtone: 'custom' }));
      toast({ title: 'Custom tone loaded', description: file.name });
    };
    reader.readAsDataURL(file);
  };

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('patient_reminders')
      .select('*')
      .eq('patient_id', user.id)
      .order('reminder_time');
    
    if (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive"
      });
    } else {
      setReminders(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user, fetchReminders]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const disease = getDiseaseById(formData.diseaseId);
    if (!disease) {
      toast({
        title: "Error",
        description: "Please select a valid condition",
        variant: "destructive"
      });
      return;
    }

    if (!formData.medicationName.trim() || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    const { data: inserted, error } = await supabase
      .from('patient_reminders')
      .insert({
        patient_id: user.id,
        disease_id: formData.diseaseId,
        disease_name: disease.name,
        medication_name: formData.medicationName,
        reminder_time: formData.time,
        frequency: formData.frequency,
        ringtone: formData.ringtone,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive"
      });
    } else {
      if (formData.ringtone === 'custom' && customAudioData && inserted) {
        try { localStorage.setItem(`reminder_audio_${inserted.id}`, customAudioData); } catch {}
      }
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      toast({
        title: "Reminder Created",
        description: `Reminder set for ${formData.medicationName} at ${formData.time}`,
      });

      setFormData({
        diseaseId: '',
        medicationName: '',
        time: '',
        frequency: 'daily',
        ringtone: 'default'
      });
      setCustomAudioData(null);
      setIsCreating(false);
      fetchReminders();
    }
    setSaving(false);
  };

  const toggleReminder = async (reminder: Reminder) => {
    const { error } = await supabase
      .from('patient_reminders')
      .update({ is_active: !reminder.is_active })
      .eq('id', reminder.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      });
    } else {
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, is_active: !r.is_active } : r
      ));
      toast({
        title: reminder.is_active ? "Reminder Paused" : "Reminder Activated",
        description: reminder.is_active ? "Reminder has been paused" : "Reminder is now active",
      });
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('patient_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive"
      });
    } else {
      setReminders(reminders.filter(r => r.id !== id));
      toast({
        title: "Reminder Deleted",
        description: "Reminder has been removed successfully",
      });
    }
  };

  const testRingtone = (ringtone: string) => {
    stopRinging();
    if (ringtone === 'custom' && customAudioData) {
      stopFn = playAudioSrc(customAudioData);
    } else {
      stopFn = playTone(ringtone);
    }
    toast({ title: '🔊 Playing preview', description: 'Tap Stop to end.' });
    setTimeout(() => stopRinging(), 4000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            Health Reminders
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your medication schedules and never miss a dose
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Bell className="w-4 h-4 mr-2" />
          New Reminder
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Reminder</h2>
          <form onSubmit={handleCreateReminder} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disease">Health Condition</Label>
              <Select value={formData.diseaseId} onValueChange={(value) => setFormData({...formData, diseaseId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {getAllDiseases().map((disease) => (
                    <SelectItem key={disease.id} value={disease.id}>
                      {disease.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medication">Medication Name</Label>
              <Input
                id="medication"
                placeholder="Enter medication name"
                value={formData.medicationName}
                onChange={(e) => setFormData({...formData, medicationName: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice">Twice a day</SelectItem>
                  <SelectItem value="thrice">Three times a day</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ringtone">Ringtone</Label>
              <div className="flex gap-2">
                <Select value={formData.ringtone} onValueChange={(value) => setFormData({...formData, ringtone: value})}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RINGTONE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => testRingtone(formData.ringtone)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => customFileRef.current?.click()}
                  title="Upload custom audio"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  ref={customFileRef}
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && onCustomFile(e.target.files[0])}
                />
              </div>
              {formData.ringtone === 'custom' && !customAudioData && (
                <p className="text-xs text-warning">Upload an audio file to use as your custom tone.</p>
              )}
            </div>

            <div className="md:col-span-2 flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Reminder'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reminders List */}
      <div className="grid gap-4">
        {reminders.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reminders yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first medication reminder to stay on track with your health
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create First Reminder
            </Button>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${reminder.is_active ? 'bg-success' : 'bg-muted'}`} />
                    <h3 className="font-semibold">{reminder.medication_name}</h3>
                    <Badge variant="secondary">{reminder.frequency}</Badge>
                    {!reminder.is_active && <Badge variant="outline">Paused</Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm">{reminder.disease_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {reminder.reminder_time}
                    </span>
                    {reminder.ringtone && (
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {reminder.ringtone}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleReminder(reminder)}
                  >
                    {reminder.is_active ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Medical Disclaimer */}
      <Card className="mt-8 border-warning/50 bg-warning/5">
        <div className="p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Reminder Tips</p>
            <p className="text-sm text-muted-foreground">
              When your alarm rings, you'll see: "✅ Good job! Your task is completed. Thanks for choosing Healthy Reminder 🌿"
            </p>
          </div>
        </div>
      </Card>

      {/* Ringing Alarm Overlay */}
      {ringing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-primary animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold mb-2">💊 Time for your medicine!</h2>
            <p className="text-lg font-semibold text-primary">{ringing.medication_name}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {ringing.disease_name} • {ringing.reminder_time}
            </p>
            <Button size="lg" className="w-full gap-2" onClick={dismissAlarm}>
              <StopCircle className="w-5 h-5" />I've taken it — Stop alarm
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reminders;
