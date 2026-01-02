import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Plus, Phone, Trash2, User, Edit2, Bell } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean;
  notify_on_sos: boolean;
}

interface EmergencyContactsProps {
  userId: string;
  onContactsChange?: (contacts: EmergencyContact[]) => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ userId, onContactsChange }) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    relationship: 'family',
    is_primary: false,
    notify_on_sos: true
  });

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []) as EmergencyContact[];
      setContacts(typedData);
      onContactsChange?.(typedData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone_number) {
      toast({
        title: "Missing Information",
        description: "Please enter name and phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingContact) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
            notify_on_sos: formData.notify_on_sos
          })
          .eq('id', editingContact.id);

        if (error) throw error;

        toast({
          title: "Contact Updated",
          description: "Emergency contact has been updated"
        });
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: userId,
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
            notify_on_sos: formData.notify_on_sos
          });

        if (error) throw error;

        toast({
          title: "Contact Added",
          description: "Emergency contact has been added"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save contact",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Contact Deleted",
        description: "Emergency contact has been removed"
      });
      
      fetchContacts();
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone_number: '',
      relationship: 'family',
      is_primary: false,
      notify_on_sos: true
    });
    setEditingContact(null);
  };

  const openEditDialog = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone_number: contact.phone_number,
      relationship: contact.relationship || 'family',
      is_primary: contact.is_primary,
      notify_on_sos: contact.notify_on_sos
    });
    setDialogOpen(true);
  };

  const relationships = [
    { value: 'family', label: 'Family' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'friend', label: 'Friend' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Phone className="h-5 w-5 text-destructive" />
          Emergency Contacts
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Contact name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({...formData, relationship: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map(rel => (
                      <SelectItem key={rel.value} value={rel.value}>
                        {rel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notify on SOS</Label>
                  <p className="text-xs text-muted-foreground">
                    Alert this contact when you trigger SOS
                  </p>
                </div>
                <Switch
                  checked={formData.notify_on_sos}
                  onCheckedChange={(checked) => setFormData({...formData, notify_on_sos: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Primary Contact</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark as your main emergency contact
                  </p>
                </div>
                <Switch
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({...formData, is_primary: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingContact ? 'Update' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-6">
            <User className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No emergency contacts added</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add contacts to notify them during emergencies
            </p>
          </div>
        ) : (
          contacts.map(contact => (
            <div 
              key={contact.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  contact.is_primary ? 'bg-destructive/20' : 'bg-primary/10'
                }`}>
                  <User className={`h-5 w-5 ${
                    contact.is_primary ? 'text-destructive' : 'text-primary'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{contact.name}</p>
                    {contact.is_primary && (
                      <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                    {contact.notify_on_sos && (
                      <Bell className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contact.phone_number} • {contact.relationship || 'Contact'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => openEditDialog(contact)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
