import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Heart, 
  Bell, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Utensils,
  Pill,
  Activity,
  Phone,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Package,
  Shield,
  BarChart3,
  Brain,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAllDiseases } from '@/data/diseases';
import DiseaseCard from '@/components/DiseaseCard';
import ChatBot from '@/components/ChatBot';
import DailyHealthTip from '@/components/DailyHealthTip';

interface Reminder {
  id: string;
  disease_name: string;
  medication_name: string;
  reminder_time: string;
  is_active: boolean;
}

const PatientDashboard = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencySent, setEmergencySent] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [healthReadingsCount, setHealthReadingsCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const { toast } = useToast();
  const diseases = getAllDiseases();

  useEffect(() => {
    fetchReminders();
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setProfile(data);
    }
  };

  const fetchReminders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('patient_reminders')
        .select('*')
        .eq('patient_id', user.id)
        .eq('is_active', true)
        .order('reminder_time');
      if (data) setReminders(data);
    }
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [readingsResult, inventoryResult] = await Promise.all([
        supabase.from('health_readings').select('id', { count: 'exact' }).eq('patient_id', user.id),
        supabase.from('patient_medicine_inventory').select('id', { count: 'exact' }).eq('patient_id', user.id)
      ]);
      if (readingsResult.count) setHealthReadingsCount(readingsResult.count);
      if (inventoryResult.count) setMedicineCount(inventoryResult.count);
    }
  };

  const handleEmergency = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('emergency_requests')
      .insert({
        patient_id: user.id,
        patient_name: profile?.full_name || 'Unknown',
        patient_age: null,
        disease_name: 'Urgent Care Needed',
        description: 'Emergency assistance requested',
        status: 'pending',
        priority: 'critical'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send emergency request",
        variant: "destructive"
      });
    } else {
      setEmergencySent(true);
      toast({
        title: "Emergency Sent",
        description: "Nearby doctors have been notified. Stay calm.",
      });
    }
  };

  const nearbyDoctors = [
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'General Medicine', distance: '0.5 km', rating: 4.8 },
    { id: '2', name: 'Dr. Michael Chen', specialty: 'Cardiology', distance: '1.2 km', rating: 4.9 },
    { id: '3', name: 'Dr. Emily Davis', specialty: 'Internal Medicine', distance: '2.0 km', rating: 4.7 },
  ];

  const nearbyPharmacies = [
    { id: '1', name: 'HealthPlus Pharmacy', distance: '0.3 km', open: true },
    { id: '2', name: 'MedCare Drugstore', distance: '0.8 km', open: true },
    { id: '3', name: 'City Pharmacy', distance: '1.5 km', open: false },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <span className="text-2xl">💙</span> Healthy Reminder
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.full_name || 'Patient'}! Track your health journey.
            </p>
          </div>
          <Button 
            variant="destructive" 
            size="lg" 
            className="gap-2 animate-pulse"
            onClick={() => setShowEmergencyDialog(true)}
          >
            <AlertTriangle className="w-5 h-5" />
            Emergency
          </Button>
        </div>
      </div>

      {/* Daily Health Tip */}
      <DailyHealthTip />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-secondary/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{diseases.length}</p>
              <p className="text-xs text-muted-foreground">Diseases Tracked</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reminders.length}</p>
              <p className="text-xs text-muted-foreground">Active Reminders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{nearbyDoctors.length}</p>
              <p className="text-xs text-muted-foreground">Nearby Doctors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <Pill className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{nearbyPharmacies.length}</p>
              <p className="text-xs text-muted-foreground">Nearby Pharmacies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Features */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link to="/daily-log">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium">Daily Journal</h3>
              <p className="text-xs text-muted-foreground">Log symptoms & get tips</p>
              <Badge className="bg-primary/80">New</Badge>
            </CardContent>
          </Card>
        </Link>
        <Link to="/health-tracking">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium">Health Tracking</h3>
              <p className="text-xs text-muted-foreground">Track BP, Sugar & more</p>
              {healthReadingsCount > 0 && (
                <Badge variant="secondary">{healthReadingsCount} readings</Badge>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link to="/medicine-inventory">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-medium">Medicine Stock</h3>
              <p className="text-xs text-muted-foreground">Refill predictions</p>
              {medicineCount > 0 && (
                <Badge variant="secondary">{medicineCount} medicines</Badge>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link to="/adherence-report">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-medium">Adherence Report</h3>
              <p className="text-xs text-muted-foreground">Weekly compliance</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/emergency-contacts">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-medium">Emergency Contacts</h3>
              <p className="text-xs text-muted-foreground">Quick access help</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="diseases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diseases" className="gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Diseases</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Reminders</span>
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Nearby</span>
          </TabsTrigger>
          <TabsTrigger value="meals" className="gap-2">
            <Utensils className="w-4 h-4" />
            <span className="hidden sm:inline">Meals</span>
          </TabsTrigger>
        </TabsList>

        {/* Diseases Tab */}
        <TabsContent value="diseases" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chronic Diseases</h2>
            <p className="text-sm text-muted-foreground">Showing {diseases.length} conditions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases.map((disease) => (
              <DiseaseCard
                key={disease.id}
                id={disease.id}
                name={disease.name}
                medications={disease.medications.map(m => m.name)}
                description={disease.description}
                backgroundImage={disease.backgroundImage}
              />
            ))}
          </div>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Medicine Reminders</h2>
            <Link to="/reminders/new">
              <Button className="gap-2">
                <Bell className="w-4 h-4" />
                New Reminder
              </Button>
            </Link>
          </div>
          
          {reminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Active Reminders</h3>
                <p className="text-muted-foreground mb-4">Set up medicine reminders to stay on track</p>
                <Link to="/reminders/new">
                  <Button>Create First Reminder</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Pill className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{reminder.medication_name}</h3>
                        <p className="text-sm text-muted-foreground">{reminder.disease_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {reminder.reminder_time}
                      </Badge>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Nearby Doctors & Pharmacies Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nearby Doctors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Nearby Doctors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nearbyDoctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{doctor.name}</h4>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {doctor.distance}
                      </Badge>
                      <p className="text-xs text-muted-foreground">⭐ {doctor.rating}</p>
                    </div>
                  </div>
                ))}
                <Link to="/doctors">
                  <Button variant="outline" className="w-full gap-2">
                    View All Doctors
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nearby Pharmacies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-5 h-5 text-secondary" />
                  Nearby Pharmacies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nearbyPharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{pharmacy.name}</h4>
                      <Badge variant={pharmacy.open ? "secondary" : "outline"} className="text-xs">
                        {pharmacy.open ? 'Open Now' : 'Closed'}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {pharmacy.distance}
                    </Badge>
                  </div>
                ))}
                <Link to="/shop">
                  <Button variant="outline" className="w-full gap-2">
                    View All Pharmacies
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meal Plans Tab */}
        <TabsContent value="meals" className="space-y-6">
          <h2 className="text-xl font-semibold">Daily Meal Plans</h2>
          <p className="text-muted-foreground">Select a disease to view recommended meal plans</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diseases.slice(0, 6).map((disease) => (
              <Link key={disease.id} to={`/disease/${disease.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{disease.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Morning</Badge>
                        <span className="text-muted-foreground truncate">{disease.mealPlan.morning[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Afternoon</Badge>
                        <span className="text-muted-foreground truncate">{disease.mealPlan.afternoon[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Medical Disclaimer */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Medical Disclaimer</p>
            <p className="text-sm text-muted-foreground">
              This platform does not replace professional medical advice. Always consult with healthcare professionals for diagnosis and treatment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Emergency Request
            </DialogTitle>
            <DialogDescription>
              This will notify all nearby doctors about your emergency situation.
            </DialogDescription>
          </DialogHeader>
          
          {emergencySent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Emergency Request Sent!</h3>
              <p className="text-muted-foreground mb-4">
                Nearby doctors have been notified. Please stay calm and wait for assistance.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Call 911
                </Button>
                <Button onClick={() => { setShowEmergencyDialog(false); setEmergencySent(false); }}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to send an emergency request? This will mark you as a high-priority patient.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEmergencyDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleEmergency} className="flex-1 gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Send Emergency
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ChatBot />
    </div>
  );
};

export default PatientDashboard;
