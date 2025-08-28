import { useState } from "react";
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
import { Calendar as CalendarIcon, PlusCircle, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";

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
  symptoms: z.string().min(1, "Please describe the symptoms"),
  actionsTaken: z.string().optional(),
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
}).refine(data => {
  // If medicationsGiven exists, it must have at least one item
  if (data.medicationsGiven && data.medicationsGiven.length > 0) {
    return true;
  }
  // If medicationsGiven doesn't exist or is empty, that's fine
  return true;
});

type ReadingFormValues = z.infer<typeof readingFormSchema>;
type EmergencyFormValues = z.infer<typeof emergencyFormSchema>;

const Forms = () => {
  const [activeTab, setActiveTab] = useState<"reading" | "emergency">("reading");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openEmergencyDatePicker, setOpenEmergencyDatePicker] = useState(false);

  const readingForm = useForm<ReadingFormValues>({
    resolver: zodResolver(readingFormSchema),
    defaultValues: {
      morningSugar: undefined,
      nightSugar: undefined,
      morningDose: undefined,
      nightDose: undefined,
      notes: "",
    },
  });

  const emergencyForm = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      sugarLevel: undefined,
      symptoms: "",
      actionsTaken: "",
      medicationsGiven: [], // Empty by default like telegram handles
      notes: "",
      time: "",
    },
  });

  const onReadingSubmit = async (values: ReadingFormValues) => {
    setIsReadingLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Reading submitted with data:", values);
      showSuccess("Reading submitted successfully");
      readingForm.reset();
    } catch (error) {
      console.error("Error submitting reading:", error);
    } finally {
      setIsReadingLoading(false);
    }
  };

  const onEmergencySubmit = async (values: EmergencyFormValues) => {
    setIsEmergencyLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Emergency form submitted with data:", values);
      showSuccess("Emergency form submitted successfully");
      emergencyForm.reset({
        sugarLevel: undefined,
        symptoms: "",
        actionsTaken: "",
        medicationsGiven: [], // Empty by default
        notes: "",
        time: "",
      });
    } catch (error) {
      console.error("Error submitting emergency form:", error);
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  const addMedication = () => {
    const currentMedications = emergencyForm.getValues("medicationsGiven") || [];
    emergencyForm.setValue("medicationsGiven", [
      ...currentMedications,
      { name: "", dose: undefined }
    ]);
  };

  const removeMedication = (index: number) => {
    const currentMedications = emergencyForm.getValues("medicationsGiven") || [];
    emergencyForm.setValue("medicationsGiven", currentMedications.filter((_, i) => i !== index));
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
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
                <form onSubmit={readingForm.handleSubmit(onReadingSubmit)} className="space-y-6">
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
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
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
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
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
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
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
                              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
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
                  
                  <Button type="submit" disabled={isReadingLoading}>
                    {isReadingLoading ? "Submitting..." : "Submit Reading"}
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
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                          />
                        </FormControl>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emergencyForm.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#475569]">
                          Symptoms <span className="text-[#dc2626]">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the symptoms experienced..."
                            className="resize-none border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emergencyForm.control}
                    name="actionsTaken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#475569]">Actions Taken</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the actions taken to address the situation..."
                            className="resize-none border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
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
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
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
                  
                  <Button type="submit" disabled={isEmergencyLoading}>
                    {isEmergencyLoading ? "Submitting..." : "Submit Emergency Report"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Forms;