import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Pill, Plus, Clock, Calendar, Bell, Trash2, Edit, Heart, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MedicineRemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "daily",
    reminder_times: [""],
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    notes: ""
  });

  useEffect(() => {
    const userInfo = localStorage.getItem('healthmate_user');
    if (!userInfo) {
      navigate('/auth', { replace: true });
      return;
    }
    
    const user = JSON.parse(userInfo);
    setUserInfo(user);
    loadReminders(user.id);

    // Real-time subscription
    const channel = supabase
      .channel('medicine-reminders-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'medicine_reminders',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadReminders(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const loadReminders = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicine_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('next_reminder', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    try {
      const nextReminder = calculateNextReminder(formData.start_date, formData.reminder_times[0]);
      
      const { error } = await supabase
        .from('medicine_reminders')
        .insert({
          user_id: userInfo.id,
          medicine_name: formData.medicine_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          reminder_times: formData.reminder_times.filter(t => t !== ""),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          notes: formData.notes,
          next_reminder: nextReminder,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicine reminder added successfully"
      });

      setIsAddDialogOpen(false);
      resetForm();
      loadReminders(userInfo.id);
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add reminder",
        variant: "destructive"
      });
    }
  };

  const handleUpdateReminder = async () => {
    try {
      const { error } = await supabase
        .from('medicine_reminders')
        .update({
          medicine_name: formData.medicine_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          reminder_times: formData.reminder_times.filter(t => t !== ""),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          notes: formData.notes
        })
        .eq('id', editingReminder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder updated successfully"
      });

      setEditingReminder(null);
      resetForm();
      loadReminders(userInfo.id);
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (reminderId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('medicine_reminders')
        .update({ is_active: !currentStatus })
        .eq('id', reminderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Reminder ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      loadReminders(userInfo.id);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleMarkAsTaken = async (reminderId) => {
    try {
      // Update next reminder time
      const reminder = reminders.find(r => r.id === reminderId);
      const nextReminder = calculateNextReminder(new Date().toISOString().split('T')[0], reminder.reminder_times[0]);

      const { error } = await supabase
        .from('medicine_reminders')
        .update({ next_reminder: nextReminder })
        .eq('id', reminderId);

      if (error) throw error;

      toast({
        title: "Marked as Taken",
        description: "Next reminder scheduled",
        duration: 2000
      });

      loadReminders(userInfo.id);
    } catch (error) {
      console.error('Error marking as taken:', error);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const { error } = await supabase
        .from('medicine_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder deleted successfully"
      });

      loadReminders(userInfo.id);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive"
      });
    }
  };

  const calculateNextReminder = (startDate, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const nextDate = new Date(startDate);
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (nextDate < now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate.toISOString();
  };

  const resetForm = () => {
    setFormData({
      medicine_name: "",
      dosage: "",
      frequency: "daily",
      reminder_times: [""],
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      notes: ""
    });
  };

  const openEditDialog = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicine_name: reminder.medicine_name,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      reminder_times: reminder.reminder_times,
      start_date: reminder.start_date,
      end_date: reminder.end_date || "",
      notes: reminder.notes || ""
    });
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      reminder_times: [...formData.reminder_times, ""]
    });
  };

  const updateTimeSlot = (index, value) => {
    const newTimes = [...formData.reminder_times];
    newTimes[index] = value;
    setFormData({ ...formData, reminder_times: newTimes });
  };

  const removeTimeSlot = (index) => {
    const newTimes = formData.reminder_times.filter((_, i) => i !== index);
    setFormData({ ...formData, reminder_times: newTimes });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/user-dashboard')}>
              ← Back
            </Button>
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Medicine Reminders</span>
          </div>
          
          <Dialog open={isAddDialogOpen || !!editingReminder} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingReminder(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingReminder ? 'Edit' : 'Add'} Medicine Reminder</DialogTitle>
                <DialogDescription>
                  Set up reminders to never miss your medication
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Medicine Name *</Label>
                  <Input
                    value={formData.medicine_name}
                    onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div>
                  <Label>Dosage *</Label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg, 1 tablet"
                  />
                </div>

                <div>
                  <Label>Frequency *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="thrice_daily">Thrice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div>
                  <Label>Reminder Times *</Label>
                  {formData.reminder_times.map((time, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                      />
                      {formData.reminder_times.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addTimeSlot}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Time
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional instructions..."
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={editingReminder ? handleUpdateReminder : handleAddReminder}
                  disabled={!formData.medicine_name || !formData.dosage}
                >
                  {editingReminder ? 'Update' : 'Add'} Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Active Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Active Reminders
            </CardTitle>
            <CardDescription>
              Your scheduled medications - tap "Taken" to mark complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : reminders.filter(r => r.is_active).length > 0 ? (
              <div className="space-y-3">
                {reminders.filter(r => r.is_active).map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <Pill className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{reminder.medicine_name}</h3>
                            <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {reminder.reminder_times?.join(', ')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {reminder.frequency.replace('_', ' ')}
                          </div>
                          {reminder.next_reminder && (
                            <Badge variant="outline">
                              Next: {new Date(reminder.next_reminder).toLocaleString()}
                            </Badge>
                          )}
                        </div>

                        {reminder.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{reminder.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsTaken(reminder.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Taken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(reminder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(reminder.id, reminder.is_active)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active reminders</p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add Your First Reminder
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Reminders */}
        {reminders.filter(r => !r.is_active).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Inactive Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders.filter(r => !r.is_active).map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded-lg opacity-60">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{reminder.medicine_name}</h3>
                        <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(reminder.id, reminder.is_active)}
                        >
                          Reactivate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MedicineRemindersPage;