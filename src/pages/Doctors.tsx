import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, MapPin, Phone, Star, Clock, User, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DoctorProfile {
  id: string;
  user_id: string;
  specialty: string | null;
  years_of_experience: number | null;
  consultation_fee: number | null;
  rating: number | null;
  bio: string | null;
  available_hours: string | null;
  available_days: string[] | null;
  is_verified: boolean | null;
  hospital_affiliation: string | null;
  full_name?: string | null;
}

const Doctors = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    // Fetch doctor profiles with their basic profile info
    const { data: doctorData, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .order('rating', { ascending: false });

    if (!error && doctorData) {
      // Fetch associated profile names
      const userIds = doctorData.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const doctorsWithNames = doctorData.map(doctor => ({
        ...doctor,
        full_name: profiles?.find(p => p.user_id === doctor.user_id)?.full_name
      }));

      setDoctors(doctorsWithNames);
    }
    setLoading(false);
  };

  const handleBookAppointment = async () => {
    if (!user || !selectedDoctor) {
      toast({
        title: "Login Required",
        description: "Please login to book appointments",
        variant: "destructive"
      });
      return;
    }

    setBooking(true);

    const { error } = await supabase
      .from('consultations')
      .insert({
        doctor_id: selectedDoctor.user_id,
        patient_id: user.id,
        disease_name: 'General Consultation',
        notes: bookingNotes,
        status: 'scheduled',
        scheduled_at: new Date().toISOString()
      });

    if (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Appointment Booked! 📅",
        description: `Your appointment with Dr. ${selectedDoctor.full_name || 'Doctor'} has been scheduled.`,
      });
      setShowBookingDialog(false);
      setSelectedDoctor(null);
      setBookingNotes('');
    }
    setBooking(false);
  };

  const openBookingDialog = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setBookingNotes('');
    setShowBookingDialog(true);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.hospital_affiliation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock doctors for display when no real ones exist
  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : [
    {
      id: '1',
      user_id: 'mock1',
      full_name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      rating: 4.8,
      years_of_experience: 12,
      consultation_fee: 150,
      available_hours: '9 AM - 5 PM',
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hospital_affiliation: 'City Medical Center',
      bio: 'Specialized in heart diseases and preventive cardiology.',
      is_verified: true
    },
    {
      id: '2',
      user_id: 'mock2',
      full_name: 'Dr. Michael Chen',
      specialty: 'Endocrinologist',
      rating: 4.9,
      years_of_experience: 15,
      consultation_fee: 175,
      available_hours: '10 AM - 6 PM',
      available_days: ['Monday', 'Wednesday', 'Friday'],
      hospital_affiliation: 'Health Plaza Medical',
      bio: 'Expert in diabetes management and thyroid disorders.',
      is_verified: true
    },
    {
      id: '3',
      user_id: 'mock3',
      full_name: 'Dr. Emily Davis',
      specialty: 'Pulmonologist',
      rating: 4.7,
      years_of_experience: 8,
      consultation_fee: 130,
      available_hours: '8 AM - 4 PM',
      available_days: ['Tuesday', 'Thursday', 'Saturday'],
      hospital_affiliation: 'Regional Respiratory Care',
      bio: 'Treating respiratory conditions including asthma and COPD.',
      is_verified: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 mr-3 text-primary" />
              Find Nearby Doctors
            </h1>
            <p className="text-muted-foreground">Connect with healthcare professionals in your area</p>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search by specialty, doctor name, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md mx-auto block"
            />
          </div>

          <div className="grid gap-4">
            {displayDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{doctor.full_name || 'Doctor'}</h3>
                          {doctor.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline">{doctor.specialty || 'General Medicine'}</Badge>
                        
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-warning fill-current" />
                            {doctor.rating || 'N/A'} rating
                            {doctor.years_of_experience && (
                              <span className="ml-2">• {doctor.years_of_experience} years exp.</span>
                            )}
                          </div>
                          {doctor.hospital_affiliation && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {doctor.hospital_affiliation}
                            </div>
                          )}
                          {doctor.available_hours && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {doctor.available_hours}
                            </div>
                          )}
                          {doctor.consultation_fee && (
                            <div className="font-medium text-primary">
                              Consultation: ${doctor.consultation_fee}
                            </div>
                          )}
                        </div>
                        
                        {doctor.bio && (
                          <p className="text-sm text-muted-foreground mt-2">{doctor.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 w-full md:w-auto">
                      <Button onClick={() => openBookingDialog(doctor)}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Book Appointment
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center bg-destructive/10 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2 text-destructive">Medical Emergency?</h2>
            <p className="text-muted-foreground mb-4">If this is a medical emergency, call 911 immediately</p>
            <Button variant="destructive" size="lg">Call 911</Button>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && `Schedule a consultation with Dr. ${selectedDoctor.full_name || 'Doctor'}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedDoctor.full_name || 'Doctor'}</h4>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                {selectedDoctor.consultation_fee && (
                  <p className="text-lg font-bold text-primary mt-2">
                    ${selectedDoctor.consultation_fee} per consultation
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Visit (Optional)</label>
                <Textarea
                  placeholder="Describe your symptoms or reason for consultation..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleBookAppointment} disabled={booking} className="flex-1">
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Doctors;
