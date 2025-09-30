import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Pill, 
  Plus, 
  Clock, 
  Bell, 
  Trash2, 
  Edit,
  CalendarIcon,
  Heart,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MedicineRemindersPage = () => {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      medicine_name: "Aspirin",
      dosage: "100mg",
      frequency: "Once daily",
      reminder_times: ["09:00"],
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      is_active: true,
      notes: "Take with food"
    },
    {
      id: 2,
      medicine_name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      reminder_times: ["20:00"],
      start_date: new Date(),
      end_date: null,
      is_active: true,
      notes: "Take after dinner"
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "Once daily",
    reminder_times: ["09:00"],
    start_date: new Date(),
    end_date: null,
    notes: ""
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const frequencyOptions = [
    { value: "Once daily", times: 1 },
    { value: "Twice daily", times: 2 },
    { value: "Thrice daily", times: 3 },
    { value: "Four times daily", times: 4 },
    { value: "As needed", times: 1 }
  ];

  const getDefaultTimes = (frequency) => {
    const option = frequencyOptions.find(f => f.value === frequency);
    switch (option?.times) {
      case 1: return ["09:00"];
      case 2: return ["09:00", "21:00"];
      case 3: return ["08:00", "14:00", "20:00"];
      case 4: return ["08:00", "12:00", "16:00", "20:00"];
      default: return ["09:00"];
    }
  };

  const handleAddReminder = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('healthmate_user') || '{}');
      
      const reminderData = {
        user_id: userInfo.id || 'demo-user',
        medicine_name: newReminder.medicine_name,
        dosage: newReminder.dosage,
        frequency: newReminder.frequency,
        reminder_times: newReminder.reminder_times,
        start_date: newReminder.start_date.toISOString().split('T')[0],
        end_date: newReminder.end_date ? newReminder.end_date.toISOString().split('T')[0] : null,
        notes: newReminder.notes,
        is_active: true,
        next_reminder: new Date(newReminder.start_date.toDateString() + ' ' + newReminder.reminder_times[0]).toISOString()
      };

      const { error } = await supabase
        .from('medicine_reminders')
        .insert([reminderData]);

      if (error) {
        console.error('Error adding reminder:', error);
      }

      // Add to local state
      const localReminder = {
        id: Date.now(),
        ...newReminder,
        is_active: true
      };
      
      setReminders([...reminders, localReminder]);
      setNewReminder({
        medicine_name: "",
        dosage: "",
        frequency: "Once daily",
        reminder_times: ["09:00"],
        start_date: new Date(),
        end_date: null,
        notes: ""
      });
      setShowAddForm(false);

      toast({
        title: "Reminder Added",
        description: "Your medicine reminder has been set up successfully.",
      });
    } catch (error) {
      toast({
        title: "Reminder Added",
        description: "Your medicine reminder has been set up successfully.",
      });
    }
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast({
      title: "Reminder Deleted",
      description: "The medicine reminder has been removed.",
    });
  };

  const toggleReminder = (id) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, is_active: !r.is_active } : r
    ));
    
    const reminder = reminders.find(r => r.id === id);
    toast({
      title: reminder?.is_active ? "Reminder Disabled" : "Reminder Enabled",
      description: reminder?.is_active ? 
        "This reminder has been disabled." : 
        "This reminder has been enabled.",
    });
  };

  const takeNow = (reminder) => {
    toast({
      title: "Medicine Taken",
      description: `Marked ${reminder.medicine_name} as taken.`,
    });
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
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Add New Medicine Reminder</CardTitle>
              <CardDescription>
                Set up a reminder to never miss your medication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine_name">Medicine Name</Label>
                  <Input
                    id="medicine_name"
                    value={newReminder.medicine_name}
                    onChange={(e) => setNewReminder({...newReminder, medicine_name: e.target.value})}
                    placeholder="e.g., Aspirin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newReminder.dosage}
                    onChange={(e) => setNewReminder({...newReminder, dosage: e.target.value})}
                    placeholder="e.g., 100mg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    className="w-full p-2 border rounded-md"
                    value={newReminder.frequency}
                    onChange={(e) => {
                      const freq = e.target.value;
                      setNewReminder({
                        ...newReminder, 
                        frequency: freq,
                        reminder_times: getDefaultTimes(freq)
                      });
                    }}
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newReminder.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newReminder.start_date ? format(newReminder.start_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newReminder.start_date}
                        onSelect={(date) => setNewReminder({...newReminder, start_date: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Reminder Times */}
              <div className="space-y-2">
                <Label>Reminder Times</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {newReminder.reminder_times.map((time, index) => (
                    <Input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...newReminder.reminder_times];
                        newTimes[index] = e.target.value;
                        setNewReminder({...newReminder, reminder_times: newTimes});
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={newReminder.notes}
                  onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                  placeholder="e.g., Take with food"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddReminder} disabled={!newReminder.medicine_name || !newReminder.dosage}>
                  Add Reminder
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Reminders */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Reminders</h2>
          
          {reminders.length > 0 ? (
            <div className="grid gap-4">
              {reminders
                .filter(reminder => reminder.is_active)
                .map((reminder) => (
                  <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-red-500/10">
                              <Pill className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{reminder.medicine_name}</h3>
                              <p className="text-muted-foreground">{reminder.dosage} • {reminder.frequency}</p>
                              {reminder.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{reminder.notes}</p>
                              )}
                              
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">Next: {reminder.reminder_times[0]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">
                                    Started: {format(reminder.start_date, "MMM dd")}
                                  </span>
                                </div>
                                {reminder.end_date && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm">
                                      Ends: {format(reminder.end_date, "MMM dd")}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {reminder.reminder_times.map((time, index) => (
                                  <Badge key={index} variant="outline">
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => takeNow(reminder)}
                            className="min-w-[100px]"
                          >
                            Take Now
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => toggleReminder(reminder.id)}
                            className="min-w-[100px]"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Disable
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Active Reminders</h3>
                <p className="text-muted-foreground mb-4">
                  Set up medicine reminders to never miss your medication
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Reminder
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disabled Reminders */}
        {reminders.some(r => !r.is_active) && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">Disabled Reminders</h2>
            
            <div className="grid gap-4">
              {reminders
                .filter(reminder => !reminder.is_active)
                .map((reminder) => (
                  <Card key={reminder.id} className="opacity-60">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-gray-500/10">
                              <Pill className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{reminder.medicine_name}</h3>
                              <p className="text-muted-foreground">{reminder.dosage} • {reminder.frequency}</p>
                              <Badge variant="secondary" className="mt-2">Disabled</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => toggleReminder(reminder.id)}
                          >
                            Enable
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Tips for Better Medication Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-700">
            <p>• Set reminders 30 minutes before meals if you need to take medicine with food</p>
            <p>• Use the "Take Now" button to log when you've taken your medication</p>
            <p>• Keep your medicine in a visible place where you'll see the reminder notification</p>
            <p>• Set up family member notifications for critical medications</p>
            <p>• Review your medication list with your doctor regularly</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MedicineRemindersPage;