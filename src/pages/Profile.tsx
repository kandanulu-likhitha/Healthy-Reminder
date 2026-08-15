import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  LogOut, 
  Stethoscope, 
  Building2,
  Award,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type DoctorProfile = Database['public']['Tables']['doctor_profiles']['Row'];
type PharmacyProfile = Database['public']['Tables']['pharmacy_profiles']['Row'];

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [doctorProfile, setDoctorProfile] = useState<Partial<DoctorProfile>>({});
  const [pharmacyProfile, setPharmacyProfile] = useState<Partial<PharmacyProfile>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleData) {
        setRole(roleData.role);
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch role-specific profile
      if (roleData?.role === 'doctor') {
        const { data: doctorData } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (doctorData) {
          setDoctorProfile(doctorData);
        }
      } else if (roleData?.role === 'pharmacy') {
        const { data: pharmacyData } = await supabase
          .from('pharmacy_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (pharmacyData) {
          setPharmacyProfile(pharmacyData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Update base profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Update role-specific profile
      if (role === 'doctor') {
        const { error: doctorError } = await supabase
          .from('doctor_profiles')
          .upsert({
            user_id: user.id,
            ...doctorProfile,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (doctorError) throw doctorError;
      } else if (role === 'pharmacy') {
        const { error: pharmacyError } = await supabase
          .from('pharmacy_profiles')
          .upsert({
            user_id: user.id,
            ...pharmacyProfile,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (pharmacyError) throw pharmacyError;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: unknown) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="w-5 h-5" />;
      case 'pharmacy':
        return <Building2 className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'doctor':
        return 'Doctor';
      case 'pharmacy':
        return 'Pharmacy';
      default:
        return 'Patient';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            {getRoleIcon()}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{profile.full_name || 'Welcome!'}</CardTitle>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            {getRoleIcon()}
            {getRoleLabel()}
          </Badge>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          {role === 'doctor' && <TabsTrigger value="professional">Professional</TabsTrigger>}
          {role === 'pharmacy' && <TabsTrigger value="business">Business</TabsTrigger>}
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || user?.email || ''}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {role === 'doctor' && (
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Specialty
                    </Label>
                    <Input
                      id="specialty"
                      value={doctorProfile.specialty || ''}
                      onChange={(e) => setDoctorProfile({...doctorProfile, specialty: e.target.value})}
                      placeholder="e.g., Cardiology, Pediatrics"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license" className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      License Number
                    </Label>
                    <Input
                      id="license"
                      value={doctorProfile.license_number || ''}
                      onChange={(e) => setDoctorProfile({...doctorProfile, license_number: e.target.value})}
                      placeholder="Enter license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={doctorProfile.years_of_experience || ''}
                      onChange={(e) => setDoctorProfile({...doctorProfile, years_of_experience: parseInt(e.target.value) || null})}
                      placeholder="Years"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fee" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Consultation Fee
                    </Label>
                    <Input
                      id="fee"
                      type="number"
                      value={doctorProfile.consultation_fee || ''}
                      onChange={(e) => setDoctorProfile({...doctorProfile, consultation_fee: parseFloat(e.target.value) || null})}
                      placeholder="Fee amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital Affiliation</Label>
                    <Input
                      id="hospital"
                      value={doctorProfile.hospital_affiliation || ''}
                      onChange={(e) => setDoctorProfile({...doctorProfile, hospital_affiliation: e.target.value})}
                      placeholder="Hospital name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Available Hours
                    </Label>
                    <Input
                      id="hours"
                      value={doctorProfile.available_hours || ''}
                      onChange={(e) => setDoctorProfile({...doctorProfile, available_hours: e.target.value})}
                      placeholder="e.g., 9 AM - 5 PM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={doctorProfile.bio || ''}
                    onChange={(e) => setDoctorProfile({...doctorProfile, bio: e.target.value})}
                    placeholder="Tell patients about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {role === 'pharmacy' && (
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Pharmacy Name
                    </Label>
                    <Input
                      id="pharmacyName"
                      value={pharmacyProfile.pharmacy_name || ''}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, pharmacy_name: e.target.value})}
                      placeholder="Enter pharmacy name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pharmacyLicense" className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      License Number
                    </Label>
                    <Input
                      id="pharmacyLicense"
                      value={pharmacyProfile.license_number || ''}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, license_number: e.target.value})}
                      placeholder="Enter license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operatingHours" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Operating Hours
                    </Label>
                    <Input
                      id="operatingHours"
                      value={pharmacyProfile.operating_hours || ''}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, operating_hours: e.target.value})}
                      placeholder="e.g., 8 AM - 10 PM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      value={pharmacyProfile.delivery_radius_km || ''}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, delivery_radius_km: parseInt(e.target.value) || null})}
                      placeholder="Delivery radius"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="delivery"
                    checked={pharmacyProfile.delivery_available || false}
                    onChange={(e) => setPharmacyProfile({...pharmacyProfile, delivery_available: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="delivery">Delivery Available</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
