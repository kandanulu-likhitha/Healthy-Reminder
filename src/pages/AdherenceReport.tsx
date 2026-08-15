import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Award,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface ReminderLog {
  id: string;
  reminder_id: string;
  status: string;
  scheduled_time: string;
  action_time: string | null;
}

interface Reminder {
  id: string;
  medication_name: string;
  disease_name: string;
}

const AdherenceReport = () => {
  const { user, loading: authLoading } = useAuth(true);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const weekAgo = subDays(new Date(), 7).toISOString();

    const [logsResult, remindersResult] = await Promise.all([
      supabase
        .from('reminder_logs')
        .select('*')
        .eq('patient_id', user.id)
        .gte('scheduled_time', weekAgo)
        .order('scheduled_time', { ascending: false }),
      supabase
        .from('patient_reminders')
        .select('id, medication_name, disease_name')
        .eq('patient_id', user.id)
    ]);

    if (logsResult.data) setLogs(logsResult.data);
    if (remindersResult.data) setReminders(remindersResult.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const calculateOverallAdherence = () => {
    const completed = logs.filter(l => l.status === 'taken').length;
    const total = logs.filter(l => l.status !== 'pending').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStatusCounts = () => {
    const taken = logs.filter(l => l.status === 'taken').length;
    const skipped = logs.filter(l => l.status === 'skipped').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    return { taken, skipped, missed };
  };

  const getPieData = () => {
    const { taken, skipped, missed } = getStatusCounts();
    return [
      { name: 'Taken', value: taken, color: 'hsl(var(--success))' },
      { name: 'Skipped', value: skipped, color: 'hsl(var(--warning))' },
      { name: 'Missed', value: missed, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  };

  const getWeeklyData = () => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => 
        format(new Date(l.scheduled_time), 'yyyy-MM-dd') === dayStr
      );
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      const skipped = dayLogs.filter(l => l.status === 'skipped').length;
      const missed = dayLogs.filter(l => l.status === 'missed').length;

      return {
        day: format(day, 'EEE'),
        taken,
        skipped,
        missed
      };
    });
  };

  const getMedicineAdherence = () => {
    return reminders.map(reminder => {
      const reminderLogs = logs.filter(l => l.reminder_id === reminder.id);
      const taken = reminderLogs.filter(l => l.status === 'taken').length;
      const total = reminderLogs.filter(l => l.status !== 'pending').length;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        ...reminder,
        adherence,
        taken,
        total
      };
    });
  };

  const getAdherenceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-success' };
    if (score >= 70) return { label: 'Good', color: 'text-primary' };
    if (score >= 50) return { label: 'Fair', color: 'text-warning' };
    return { label: 'Needs Improvement', color: 'text-destructive' };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading adherence data...</p>
        </div>
      </div>
    );
  }

  const overallAdherence = calculateOverallAdherence();
  const { taken, skipped, missed } = getStatusCounts();
  const adherenceLevel = getAdherenceLevel(overallAdherence);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          Adherence Report
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your medication compliance over the past week
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 md:col-span-1">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  strokeDasharray={`${overallAdherence * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <span className="text-3xl font-bold">{overallAdherence}%</span>
                </div>
              </div>
            </div>
            <p className={`text-lg font-semibold ${adherenceLevel.color}`}>
              {adherenceLevel.label}
            </p>
            <p className="text-sm text-muted-foreground">Weekly Adherence</p>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{taken}</p>
              <p className="text-sm text-muted-foreground">Taken</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-warning">{skipped}</p>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">{missed}</p>
              <p className="text-sm text-muted-foreground">Missed</p>
            </div>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No dose data recorded this week</p>
              <p className="text-sm">Start tracking your doses from the Reminders page</p>
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row */}
      {logs.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Dose Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={5}
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Daily Breakdown</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taken" name="Taken" fill="hsl(var(--success))" stackId="a" />
                  <Bar dataKey="skipped" name="Skipped" fill="hsl(var(--warning))" stackId="a" />
                  <Bar dataKey="missed" name="Missed" fill="hsl(var(--destructive))" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Per-Medicine Adherence */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Adherence by Medicine</h3>
        <div className="space-y-4">
          {getMedicineAdherence().map((medicine) => (
            <div key={medicine.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{medicine.medication_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {medicine.taken}/{medicine.total} doses
                  </span>
                </div>
                <Progress value={medicine.adherence} className="h-2" />
              </div>
              <Badge variant={medicine.adherence >= 70 ? 'default' : 'secondary'}>
                {medicine.adherence}%
              </Badge>
            </div>
          ))}

          {reminders.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No medicines to track</p>
              <p className="text-sm">Add reminders to see per-medicine adherence</p>
            </div>
          )}
        </div>
      </Card>

      {/* Achievement Card */}
      {overallAdherence >= 80 && (
        <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <Award className="w-12 h-12 text-primary" />
            <div>
              <p className="font-semibold text-primary">Great Job!</p>
              <p className="text-muted-foreground">
                You're maintaining excellent medication adherence. Keep it up!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdherenceReport;
