import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Users, 
  Calendar, 
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Activity,
  Stethoscope,
  Phone,
  FileText,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyRequest {
  id: string;
  patient_name: string;
  patient_age: number | null;
  disease_name: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Consultation {
  id: string;
  patient_id: string;
  disease_name: string;
  notes: string;
  status: string;
  scheduled_at: string;
  created_at: string;
}

const DoctorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'emergencies';
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyRequest | null>(null);
  const [consultNotes, setConsultNotes] = useState('');
  const [showConsultDialog, setShowConsultDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchEmergencies();
    fetchConsultations();
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

      const { data: doctorData } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (doctorData) {
        setProfile((prev: any) => ({ ...prev, ...doctorData }));
      }
    }
  };

  const fetchEmergencies = async () => {
    const { data } = await supabase
      .from('emergency_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEmergencies(data);
  };

  const fetchConsultations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setConsultations(data);
    }
  };

  const handleAcceptEmergency = async (emergency: EmergencyRequest) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('emergency_requests')
      .update({ 
        status: 'accepted', 
        assigned_doctor_id: user.id 
      })
      .eq('id', emergency.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept emergency",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Emergency accepted. Patient has been notified.",
      });
      fetchEmergencies();
    }
  };

  const handleResolveEmergency = async (id: string) => {
    const { error } = await supabase
      .from('emergency_requests')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      toast({
        title: "Resolved",
        description: "Emergency has been marked as resolved.",
      });
      fetchEmergencies();
    }
  };

  const handleConsultNow = (patient: EmergencyRequest) => {
    setSelectedPatient(patient);
    setShowConsultDialog(true);
  };

  const handleSendConsultation = async () => {
    if (!selectedPatient || !consultNotes.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('consultations')
      .insert({
        doctor_id: user.id,
        patient_id: selectedPatient.id,
        disease_name: selectedPatient.disease_name,
        notes: consultNotes,
        status: 'completed'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save consultation notes",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Consultation notes saved successfully",
      });
      setShowConsultDialog(false);
      setConsultNotes('');
      setSelectedPatient(null);
      fetchConsultations();
    }
  };

  const pendingEmergencies = emergencies.filter(e => e.status === 'pending');
  const acceptedEmergencies = emergencies.filter(e => e.status === 'accepted');

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-8 h-8 text-primary" />
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome, Dr. {profile?.full_name || 'Doctor'}! {profile?.specialty && `| ${profile.specialty}`}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {profile?.is_verified ? '✓ Verified' : 'Pending Verification'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{pendingEmergencies.length}</p>
              <p className="text-xs text-muted-foreground">Pending Emergencies</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{acceptedEmergencies.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{consultations.length}</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{emergencies.filter(e => e.status === 'resolved').length}</p>
              <p className="text-xs text-muted-foreground">Resolved Cases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emergencies" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Emergencies
            {pendingEmergencies.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingEmergencies.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="patients" className="gap-2">
            <Users className="w-4 h-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="consultations" className="gap-2">
            <Calendar className="w-4 h-4" />
            Consultations
          </TabsTrigger>
        </TabsList>

        {/* Emergencies Tab */}
        <TabsContent value="emergencies" className="space-y-6">
          {pendingEmergencies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Urgent - Pending Emergencies
              </h2>
              {pendingEmergencies.map((emergency) => (
                <Card key={emergency.id} className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{emergency.patient_name}</h3>
                            <Badge variant="destructive">URGENT</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {emergency.disease_name}
                            {emergency.patient_age && ` • Age: ${emergency.patient_age}`}
                          </p>
                          <p className="text-sm mt-1">{emergency.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(emergency.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleConsultNow(emergency)}>
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Consult Now
                        </Button>
                        <Button size="sm" onClick={() => handleAcceptEmergency(emergency)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {acceptedEmergencies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-warning">
                <Clock className="w-5 h-5" />
                In Progress
              </h2>
              {acceptedEmergencies.map((emergency) => (
                <Card key={emergency.id} className="border-warning/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{emergency.patient_name}</h3>
                            <Badge variant="outline">In Progress</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{emergency.disease_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleResolveEmergency(emergency.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Resolved
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {emergencies.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Emergency Requests</h3>
                <p className="text-muted-foreground">All patients are doing well!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencies.filter(e => e.status === 'resolved').slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{patient.patient_name}</h4>
                        <p className="text-sm text-muted-foreground">{patient.disease_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        View History
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
                
                {emergencies.filter(e => e.status === 'resolved').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No patient records yet. Accept emergency requests to build your patient list.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{consultation.disease_name || 'General'}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(consultation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{consultation.notes}</p>
                  </div>
                ))}
                
                {consultations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No consultations recorded yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Consultation Dialog */}
      <Dialog open={showConsultDialog} onOpenChange={setShowConsultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Consultation</DialogTitle>
            <DialogDescription>
              {selectedPatient && (
                <>Patient: {selectedPatient.patient_name} - {selectedPatient.disease_name}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter consultation notes, recommendations, or treatment plan..."
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConsultDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendConsultation} className="gap-2">
                <Send className="w-4 h-4" />
                Send & Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
