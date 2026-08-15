import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Plus, 
  Trash2, 
  Star, 
  AlertTriangle,
  Loader2,
  User,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmergencyContact {
  id: string;
  contact_name: string;
  contact_phone: string;
  relationship: string | null;
  is_primary: boolean;
}

const EmergencyContacts = () => {
  const { user, loading: authLoading } = useAuth(true);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  });
  const { toast } = useToast();

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('patient_id', user.id)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load emergency contacts",
        variant: "destructive"
      });
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user, fetchContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in name and phone number",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    const isPrimary = contacts.length === 0;

    const { error } = await supabase
      .from('emergency_contacts')
      .insert({
        patient_id: user.id,
        contact_name: formData.name,
        contact_phone: formData.phone,
        relationship: formData.relationship || null,
        is_primary: isPrimary
      });

    if (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Contact Added",
        description: `${formData.name} added to emergency contacts`,
      });
      setFormData({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
      fetchContacts();
    }
    setSaving(false);
  };

  const handleSetPrimary = async (contact: EmergencyContact) => {
    // First, remove primary from all contacts
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('patient_id', user?.id);

    // Then set this one as primary
    const { error } = await supabase
      .from('emergency_contacts')
      .update({ is_primary: true })
      .eq('id', contact.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update primary contact",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Primary Contact Updated",
        description: `${contact.contact_name} is now your primary emergency contact`,
      });
      fetchContacts();
    }
  };

  const handleDeleteContact = async (contact: EmergencyContact) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contact.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Contact Deleted",
        description: `${contact.contact_name} removed from emergency contacts`,
      });
      fetchContacts();
    }
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    // In a real app, this would trigger a call
    // For web, we open the tel: link
    window.location.href = `tel:${contact.contact_phone}`;
    
    toast({
      title: "📞 Calling Emergency Contact",
      description: `Initiating call to ${contact.contact_name}...`,
    });
  };

  const getPrimaryContact = () => contacts.find(c => c.is_primary);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  const primaryContact = getPrimaryContact();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Emergency Contacts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your emergency contacts for quick access during emergencies
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Quick Emergency Button */}
      {primaryContact && (
        <Card className="p-6 mb-8 border-destructive bg-destructive/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-destructive font-medium">Emergency Button</p>
                <p className="text-2xl font-bold">{primaryContact.contact_name}</p>
                <p className="text-muted-foreground">{primaryContact.contact_phone}</p>
              </div>
            </div>
            <Button 
              size="lg" 
              variant="destructive"
              className="w-full md:w-auto text-lg px-8 py-6"
              onClick={() => handleEmergencyCall(primaryContact)}
            >
              <Phone className="w-6 h-6 mr-2" />
              CALL NOW
            </Button>
          </div>
        </Card>
      )}

      {/* Add Contact Form */}
      {showAddForm && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Emergency Contact</h2>
          <form onSubmit={handleAddContact} className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="e.g., +1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship (Optional)</Label>
              <Input
                placeholder="e.g., Spouse, Parent, Doctor"
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Contact'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Contacts List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id} className={`p-6 ${contact.is_primary ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{contact.contact_name}</h3>
                  {contact.relationship && (
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  )}
                </div>
              </div>
              {contact.is_primary && (
                <Badge variant="default">
                  <Star className="w-3 h-3 mr-1" />
                  Primary
                </Badge>
              )}
            </div>

            <p className="text-lg font-medium mb-4">{contact.contact_phone}</p>

            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => handleEmergencyCall(contact)}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              {!contact.is_primary && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSetPrimary(contact)}
                >
                  <Star className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteContact(contact)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}

        {contacts.length === 0 && (
          <Card className="p-8 text-center md:col-span-2 lg:col-span-3">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No emergency contacts</h3>
            <p className="text-muted-foreground mb-4">
              Add emergency contacts to quickly reach help when needed
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Contact
            </Button>
          </Card>
        )}
      </div>

      {/* Safety Tips */}
      <Card className="mt-8 p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Emergency Tips</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Keep your primary contact as someone who can respond quickly</li>
              <li>• Include your doctor's number for medical emergencies</li>
              <li>• Make sure contacts know about your health conditions</li>
              <li>• Test the emergency call feature periodically</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmergencyContacts;
