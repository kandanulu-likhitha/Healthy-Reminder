import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Activity, Heart, Droplets, Scale, TrendingUp, TrendingDown, Minus, Plus, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface HealthReading {
  id: string;
  reading_type: string;
  value: number;
  secondary_value: number | null;
  unit: string;
  notes: string | null;
  recorded_at: string;
}

const readingTypes = [
  { id: 'blood_sugar', name: 'Blood Sugar', unit: 'mg/dL', icon: Droplets, color: 'hsl(var(--primary))' },
  { id: 'blood_pressure', name: 'Blood Pressure', unit: 'mmHg', icon: Heart, color: 'hsl(var(--destructive))' },
  { id: 'weight', name: 'Weight', unit: 'kg', icon: Scale, color: 'hsl(var(--secondary))' },
  { id: 'heart_rate', name: 'Heart Rate', unit: 'bpm', icon: Activity, color: 'hsl(var(--accent))' },
];

const HealthTracking = () => {
  const { user, loading: authLoading } = useAuth(true);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveType] = useState('blood_sugar');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [formData, setFormData] = useState({
    type: 'blood_sugar',
    value: '',
    secondaryValue: '',
    notes: ''
  });
  const { toast } = useToast();

  const fetchReadings = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    
    const { data, error } = await supabase
      .from('health_readings')
      .select('*')
      .eq('patient_id', user.id)
      .gte('recorded_at', thirtyDaysAgo)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching readings:', error);
      toast({
        title: "Error",
        description: "Failed to load health readings",
        variant: "destructive"
      });
    } else {
      setReadings(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchReadings();
    }
  }, [user, fetchReadings]);

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const readingType = readingTypes.find(r => r.id === formData.type);
    if (!readingType || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('health_readings')
      .insert({
        patient_id: user.id,
        reading_type: formData.type,
        value: parseFloat(formData.value),
        secondary_value: formData.secondaryValue ? parseFloat(formData.secondaryValue) : null,
        unit: readingType.unit,
        notes: formData.notes || null
      });

    if (error) {
      console.error('Error adding reading:', error);
      toast({
        title: "Error",
        description: "Failed to add reading",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reading Added",
        description: `${readingType.name} reading recorded successfully`,
      });
      setFormData({ type: 'blood_sugar', value: '', secondaryValue: '', notes: '' });
      fetchReadings();
    }
    setSaving(false);
  };

  const getFilteredReadings = (type: string) => {
    const now = new Date();
    let startDate: Date;
    
    if (timeRange === 'week') {
      startDate = startOfWeek(now);
    } else {
      startDate = startOfMonth(now);
    }

    return readings
      .filter(r => r.reading_type === type && new Date(r.recorded_at) >= startDate)
      .map(r => ({
        ...r,
        date: format(new Date(r.recorded_at), timeRange === 'week' ? 'EEE' : 'MMM dd'),
        displayValue: r.reading_type === 'blood_pressure' 
          ? `${r.value}/${r.secondary_value}`
          : r.value
      }));
  };

  const getLatestReading = (type: string) => {
    const typeReadings = readings.filter(r => r.reading_type === type);
    return typeReadings[typeReadings.length - 1];
  };

  const getTrend = (type: string) => {
    const typeReadings = readings.filter(r => r.reading_type === type);
    if (typeReadings.length < 2) return 'stable';
    
    const recent = typeReadings.slice(-5);
    const avgRecent = recent.reduce((a, b) => a + b.value, 0) / recent.length;
    const older = typeReadings.slice(-10, -5);
    if (older.length === 0) return 'stable';
    const avgOlder = older.reduce((a, b) => a + b.value, 0) / older.length;
    
    const diff = ((avgRecent - avgOlder) / avgOlder) * 100;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  };

  const getAdherenceScore = () => {
    const weekAgo = subDays(new Date(), 7);
    const weekReadings = readings.filter(r => new Date(r.recorded_at) >= weekAgo);
    // Score based on how many days had at least one reading
    const uniqueDays = new Set(weekReadings.map(r => format(new Date(r.recorded_at), 'yyyy-MM-dd')));
    return Math.round((uniqueDays.size / 7) * 100);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Health Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your vital signs and track your health progress
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Weekly Adherence: {getAdherenceScore()}%
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {readingTypes.map((type) => {
          const latest = getLatestReading(type.id);
          const trend = getTrend(type.id);
          const Icon = type.icon;
          
          return (
            <Card 
              key={type.id} 
              className={`p-4 cursor-pointer transition-all ${activeType === type.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveType(type.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-primary" />
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-destructive" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-success" />}
                {trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground">{type.name}</p>
              <p className="text-2xl font-bold">
                {latest 
                  ? type.id === 'blood_pressure' 
                    ? `${latest.value}/${latest.secondary_value}`
                    : latest.value
                  : '--'
                }
              </p>
              <p className="text-xs text-muted-foreground">{type.unit}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {readingTypes.find(r => r.id === activeType)?.name} Trend
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant={timeRange === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={timeRange === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
              </div>
            </div>
            
            <div className="h-[300px]">
              {getFilteredReadings(activeType).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getFilteredReadings(activeType)}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={2}
                    />
                    {activeType === 'blood_pressure' && (
                      <Area 
                        type="monotone" 
                        dataKey="secondary_value" 
                        stroke="hsl(var(--destructive))" 
                        fill="transparent"
                        strokeWidth={2}
                        name="Diastolic"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No readings for this period</p>
                    <p className="text-sm">Add your first reading to see trends</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Readings Table */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Readings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.slice(-10).reverse().map((reading) => (
                    <tr key={reading.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Badge variant="outline">
                          {readingTypes.find(r => r.id === reading.reading_type)?.name}
                        </Badge>
                      </td>
                      <td className="py-3 font-medium">
                        {reading.reading_type === 'blood_pressure' 
                          ? `${reading.value}/${reading.secondary_value}`
                          : reading.value
                        } {reading.unit}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {format(new Date(reading.recorded_at), 'MMM dd, h:mm a')}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {reading.notes || '-'}
                      </td>
                    </tr>
                  ))}
                  {readings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No readings recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Add Reading Form */}
        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Reading
            </h2>
            <form onSubmit={handleAddReading} className="space-y-4">
              <div className="space-y-2">
                <Label>Reading Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {readingTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {formData.type === 'blood_pressure' ? 'Systolic (Top Number)' : 'Value'}
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={`Enter ${readingTypes.find(r => r.id === formData.type)?.unit}`}
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                />
              </div>

              {formData.type === 'blood_pressure' && (
                <div className="space-y-2">
                  <Label>Diastolic (Bottom Number)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter mmHg"
                    value={formData.secondaryValue}
                    onChange={(e) => setFormData({...formData, secondaryValue: e.target.value})}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="e.g., After breakfast"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reading
                  </>
                )}
              </Button>
            </form>

            {/* Quick Reference */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Normal Ranges</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Blood Sugar (Fasting): 70-100 mg/dL</li>
                <li>• Blood Pressure: 120/80 mmHg</li>
                <li>• Heart Rate: 60-100 bpm</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthTracking;
