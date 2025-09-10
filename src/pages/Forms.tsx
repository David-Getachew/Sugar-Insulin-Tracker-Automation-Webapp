import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useDatabase";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Form schemas
const readingFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  morningSugar: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(1, "Morning sugar level is required").max(500, "Value too high")
  ),
  nightSugar: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(1, "Night sugar level is required").max(500, "Value too high")
  ),
  morningDose: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Morning dose must be at least 0").max(100, "Value too high")
  ),
  nightDose: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Night dose must be at least 0").max(100, "Value too high")
  ),
  notes: z.string().optional(),
});

const emergencyFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please enter a time",
  }),
  sugarLevel: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(1, "Sugar level is required").max(500, "Value too high")
  ),
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  additionalSymptoms: z.string().optional(),
  actionsTaken: z.array(z.string()).optional(),
  additionalActions: z.string().optional(),
  medicationsGiven: z.array(
    z.object({
      name: z.string().min(1, "Medication name is required"),
      dose: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        z.number().min(0.1, "Dose must be greater than 0").max(100, "Value too high")
      ),
    })
  ).optional(),
  notes: z.string().optional(),
});

type ReadingFormValues = z.infer<typeof readingFormSchema>;
type EmergencyFormValues = z.infer<typeof emergencyFormSchema>;

const commonSymptoms = [
  "Hypoglycemia (low blood sugar)",
  "Hyperglycemia (high blood sugar)",
  "Dizziness",
  "Sweating",
  "Confusion",
  "Fatigue",
  "Nausea",
  "Headache"
];

const commonActions = [
  "Took insulin",
  "Ate sugar/snack",
  "Drank water",
  "Rested",
  "Contacted doctor",
  "Monitored blood sugar"
];

const Forms = () => {
  const { profile } = useAuth();
  const { createDailyReading, createEmergency, saveMedications, getDailyReadings } = useDatabase();
  const [activeTab, setActiveTab] = useState<"reading" | "emergency">("reading");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openEmergencyDatePicker, setOpenEmergencyDatePicker] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingReadingData, setPendingReadingData] = useState<ReadingFormValues | null>(null);
  const [existingDates, setExistingDates] = useState<string[]>([]);

  const isDemo = profile?.is_demo || false;

  const readingForm = useForm<ReadingFormValues>({
    resolver: zodResolver(readingFormSchema),
    defaultValues: {
      morningSugar: "" as any,
      nightSugar: "" as any,
      morningDose: "" as any,
      nightDose: "" as any,
      notes: "",
    },
  });

  const emergencyForm = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      sugarLevel: "" as any,
      symptoms: [],
      additionalSymptoms: "",
      actionsTaken: [],
      additionalActions: "",
      medicationsGiven: [],
      notes: "",
      time: "",
    },
  });

  // Fetch existing dates for duplicate check
  useEffect(() => {
    const fetchExistingDates = async () => {
      try {
        const readings = await getDailyReadings();
        const dates = readings.map(reading => reading.date);
        setExistingDates(dates);
      } catch (error) {
        console.error("Error fetching existing dates:", error);
      }
    };

    if (!isDemo) {
      fetchExistingDates();
    }
  }, [getDailyReadings, isDemo]);

  const checkForDuplicateDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return existingDates.includes(formattedDate);
  };

  const handleReadingSubmit = (values: ReadingFormValues) => {
    if (checkForDuplicateDate(values.date)) {
      setPendingReadingData(values);
      setShowDuplicateDialog(true);
    } else {
      onReadingSubmit(values);
    }
  };

  const onReadingSubmit = async (values: ReadingFormValues) => {
    if (isDemo) {
      showSuccess("Demo mode: Changes not saved to database");
      return;
    }

    // Check if user is authenticated
    if (!profile?.user_id) {
      showError("Please log in to save readings");
      return;
    }

    setIsReadingLoading(true);
    
    try {
      // Try with the current schema first, but prepare alternative column names
      const readingData = {
        date: format(values.date, 'yyyy-MM-dd'),
        sugar_morning: values.morningSugar,
        sugar_night: values.nightSugar,
        insulin_morning: values.morningDose,
        insulin_night: values.nightDose,
        notes: values.notes || null,
      };
      
      console.log('Attempting to save reading with data:', readingData);
      
      const success = await createDailyReading(readingData);
      
      if (success) {
        // Update existing dates after successful submission
        setExistingDates(prev => [...prev, format(values.date, 'yyyy-MM-dd')]);
        readingForm.reset();
      } else {
        showError("Failed to save reading. Please check your connection and try again.");
      }
    } catch (error) {
      console.error("Error submitting reading:", error);
      showError("An error occurred while saving. Please try again.");
    } finally {
      setIsReadingLoading(false);
      setShowDuplicateDialog(false);
      setPendingReadingData(null);
    }
  };

  const onEmergencySubmit = async (values: EmergencyFormValues) => {
    if (isDemo) {
      showSuccess("Demo mode: Emergency report not submitted");
      return;
    }

    // Check if user is authenticated
    if (!profile?.user_id) {
      showError("Please log in to save emergency reports");
      return;
    }

    setIsEmergencyLoading(true);
    
    try {
      // Combine selected symptoms with additional symptoms
      const allSymptoms = [
        ...values.symptoms,
        ...(values.additionalSymptoms ? [values.additionalSymptoms] : [])
      ].filter(Boolean);

      // Combine selected actions with additional actions
      const allActions = [
        ...(values.actionsTaken || []),
        ...(values.additionalActions ? [values.additionalActions] : [])
      ].filter(Boolean);

      const emergencyData = {
        event_date: format(values.date, 'yyyy-MM-dd'),
        event_time: values.time,
        sugar_level: values.sugarLevel,
        symptoms: allSymptoms.join(', '),
        actions_taken: allActions.length > 0 ? allActions.join(', ') : null,
        notes: values.notes || null,
      };

      // Create emergency record first
      const emergency = await createEmergency(emergencyData);
      
      // If emergency was created successfully and there are medications, save them
      if (emergency && values.medicationsGiven?.length) {
        const medications = values.medicationsGiven.filter(med => med.name && med.dose);
        if (medications.length > 0) {
          await saveMedications(emergency.id, medications);
        }
      }
      
      if (emergency) {
        // Send to N8N webhook if available
        const webhookUrl = import.meta.env.N8N_EMERGENCY_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                emergency,
                user: {
                  id: profile?.user_id,
                  name: profile?.full_name,
                  email: profile?.email,
                },
                timestamp: new Date().toISOString(),
              }),
            });
            console.log('Emergency notification sent to N8N webhook');
          } catch (webhookError) {
            console.error('Failed to send emergency notification:', webhookError);
          }
        }
      }
      
      if (emergency) {
        emergencyForm.reset({
          sugarLevel: "" as any,
          symptoms: [],
          additionalSymptoms: "",
          actionsTaken: [],
          additionalActions: "",
          medicationsGiven: [],
          notes: "",
          time: "",
        });
        showSuccess("Emergency report submitted successfully");
      } else {
        showError("Failed to save emergency report. Please check your connection and try again.");
      }
    } catch (error) {
      console.error("Error submitting emergency form:", error);
      showError("An error occurred while saving emergency report. Please try again.");
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  const addMedication = () => {
    const currentMedications = emergencyForm.getValues("medicationsGiven") || [];
    emergencyForm.setValue("medicationsGiven", [
      ...currentMedications,
      { name: "", dose: "" as any }
    ]);
  };

  const removeMedication = (index: number) => {
    const currentMedications = emergencyForm.getValues("medicationsGiven") || [];
    emergencyForm.setValue("medicationsGiven", currentMedications.filter((_, i) => i !== index));
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {isDemo && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Account — Read-Only:</strong> Form submissions will not be saved to the database.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-[#0f172a]">Data Entry Forms</h1>
        
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "reading" ? "default" : "outline"}
            onClick={() => setActiveTab("reading")}
            className={activeTab === "reading" ? "bg-[#0f766e] text-white" : "border-[#cbd5e1] text-[#475569]"}
          >
            Daily Reading
          </Button>
          <Button
            variant={activeTab === "emergency" ? "default" : "outline"}
            onClick={() => setActiveTab("emergency")}
            className={activeTab === "emergency" ? "bg-[#0f766e] text-white" : "border-[#cbd5e1] text-[#475569]"}
          >
            Emergency Form
          </Button>
        </div>
        
        {activeTab === "reading" ? (
          <Card className="bg-white border border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="text-[#0f766e]">Daily Reading Form</CardTitle>
              <CardDescription className="text-[#475569]">
                Record your daily blood sugar levels and medication doses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...readingForm}>
                <form onSubmit={readingForm.handleSubmit(handleReadingSubmit)} className="space-y-6">
                  <FormField
                    control={readingForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[#475569]">
                          Date <span className="text-[#dc2626]">*</span>
                        </FormLabel>
                        <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal justify-start",
                                  !field.value && "text-[#475569]"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setOpenDatePicker(false); // Close picker after selection
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={readingForm.control}
                      name="morningSugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">
                            Morning Sugar Level (mg/dL) <span className="text-[#dc2626]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 120" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={readingForm.control}
                      name="nightSugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">
                            Night Sugar Level (mg/dL) <span className="text-[#dc2626]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 110" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={readingForm.control}
                      name="morningDose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">
                            Morning Dose (units) <span className="text-[#dc2626]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="e.g. 12.5" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={readingForm.control}
                      name="nightDose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">
                            Night Dose (units) <span className="text-[#dc2626]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="e.g. 10.0" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={readingForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#475569]">Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about your readings..."
                            className="resize-none border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isReadingLoading || isDemo}>
                    {isDemo ? "Demo Mode - Read Only" : (isReadingLoading ? "Submitting..." : "Submit Reading")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="text-[#0f766e]">Emergency Form</CardTitle>
              <CardDescription className="text-[#475569]">
                Record emergency situations, symptoms, and medications given.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emergencyForm}>
                <form onSubmit={emergencyForm.handleSubmit(onEmergencySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emergencyForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-[#475569]">
                            Date <span className="text-[#dc2626]">*</span>
                          </FormLabel>
                          <Popover open={openEmergencyDatePicker} onOpenChange={setOpenEmergencyDatePicker}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal justify-start",
                                    !field.value && "text-[#475569]"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Select date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpenEmergencyDatePicker(false); // Close picker after selection
                                }}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emergencyForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-[#475569]">
                            Time <span className="text-[#dc2626]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="time"
                                {...field}
                                className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e] pr-10"
                              />
                              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={emergencyForm.control}
                    name="sugarLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#475569]">
                          Sugar Level (mg/dL) <span className="text-[#dc2626]">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 250" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value)}
                            className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={emergencyForm.control}
                      name="symptoms"
                      render={() => (
                        <FormItem>
                          <div className="mb-3">
                            <FormLabel className="text-[#475569]">
                              Symptoms <span className="text-[#dc2626]">*</span>
                            </FormLabel>
                            <FormDescription className="text-[#475569]">
                              Select all that apply
                            </FormDescription>
                          </div>
                          <div className="space-y-2">
                            {commonSymptoms.map((symptom) => (
                              <FormField
                                key={symptom}
                                control={emergencyForm.control}
                                name="symptoms"
                                render={({ field }) => {
                                  return (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`symptom-${symptom}`}
                                        checked={field.value?.includes(symptom)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), symptom])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== symptom
                                                )
                                              );
                                        }}
                                      />
                                      <label
                                        htmlFor={`symptom-${symptom}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {symptom}
                                      </label>
                                    </div>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emergencyForm.control}
                      name="additionalSymptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Additional Symptoms</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter any additional symptoms..." 
                              {...field} 
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={emergencyForm.control}
                      name="actionsTaken"
                      render={() => (
                        <FormItem>
                          <div className="mb-3">
                            <FormLabel className="text-[#475569]">Actions Taken</FormLabel>
                            <FormDescription className="text-[#475569]">
                              Select all that apply
                            </FormDescription>
                          </div>
                          <div className="space-y-2">
                            {commonActions.map((action) => (
                              <FormField
                                key={action}
                                control={emergencyForm.control}
                                name="actionsTaken"
                                render={({ field }) => {
                                  return (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`action-${action}`}
                                        checked={field.value?.includes(action)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), action])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== action
                                                )
                                              );
                                        }}
                                      />
                                      <label
                                        htmlFor={`action-${action}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {action}
                                      </label>
                                    </div>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emergencyForm.control}
                      name="additionalActions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Additional Actions</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter any additional actions taken..." 
                              {...field} 
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#0f172a]">Medications Given</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addMedication}
                        className="border-[#0f766e] text-[#0f766e] hover:bg-[#14b8a6] hover:text-white"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                    
                    {emergencyForm.watch("medicationsGiven") && emergencyForm.watch("medicationsGiven")!.length > 0 ? (
                      emergencyForm.watch("medicationsGiven")!.map((_, index) => (
                        <div key={index} className="flex items-end gap-4">
                          <FormField
                            control={emergencyForm.control}
                            name={`medicationsGiven.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-[#475569]">
                                  Medication Name <span className="text-[#dc2626]">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Glucagon" 
                                    {...field} 
                                    className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                  />
                                </FormControl>
                                <FormMessage className="text-[#dc2626]" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emergencyForm.control}
                            name={`medicationsGiven.${index}.dose`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <FormLabel className="text-[#475569]">
                                  Dose <span className="text-[#dc2626]">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1"
                                    placeholder="e.g. 1.0" 
                                    {...field} 
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                  />
                                </FormControl>
                                <FormMessage className="text-[#dc2626]" />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeMedication(index)}
                            className="mb-2 hover:bg-[#14b8a6] hover:text-[#0f766e]"
                          >
                            <Trash2 className="h-4 w-4 text-[#dc2626]" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-[#475569] italic">
                        No medications added. You can add medications using the "Add Medication" button above.
                      </div>
                    )}
                  </div>
                  
                  <FormField
                    control={emergencyForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#475569]">Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about the emergency..."
                            className="resize-none border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isEmergencyLoading || isDemo}>
                    {isDemo ? "Demo Mode - Read Only" : (isEmergencyLoading ? "Submitting..." : "Submit Emergency Report")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Duplicate Date Warning Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Duplicate Date Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              This date already has a form. Continuing will overwrite the existing entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDuplicateDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingReadingData && onReadingSubmit(pendingReadingData)}
              className="bg-[#0f766e] hover:bg-[#0d5c58]"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Forms;