import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  morningSugar: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
  nightSugar: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
  morningDose: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
  nightDose: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
}).refine(data => {
  return data.morningSugar !== undefined || 
         data.nightSugar !== undefined || 
         data.morningDose !== undefined || 
         data.nightDose !== undefined;
}, {
  message: "At least one reading must be provided",
  path: ["morningSugar"],
});

type FormValues = z.infer<typeof formSchema>;

const Forms = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      morningSugar: undefined,
      nightSugar: undefined,
      morningDose: undefined,
      nightDose: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dataToSubmit = {
        ...values,
        user_id: "mock-user-id-123",
        created_at: new Date().toISOString(),
      };
      
      console.log("Form submitted with data:", dataToSubmit);
      
      showSuccess("Reading submitted successfully");
      setIsSubmitted(true);
      
      form.reset({
        date: new Date(),
        morningSugar: undefined,
        nightSugar: undefined,
        morningDose: undefined,
        nightDose: undefined,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    setIsSubmitted(false);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-[#0f172a]">Submit New Readings</h1>
        
        {isSubmitted ? (
          <Card className="bg-white border border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="text-[#0f766e]">Reading Submitted</CardTitle>
              <CardDescription className="text-[#475569]">
                Your reading has been successfully recorded.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleSubmitAnother} className="w-full">
                Submit Another Reading
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-white border border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="text-[#0f766e]">New Reading</CardTitle>
              <CardDescription className="text-[#475569]">
                Enter your sugar levels and insulin doses for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[#475569]">Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-[#cbd5e1] text-[#0f172a]",
                                  !field.value && "text-[#475569]"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-[#475569]">
                          Select the date for these readings
                        </FormDescription>
                        <FormMessage className="text-[#dc2626]" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="morningSugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Morning Sugar Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormDescription className="text-[#475569]">
                            Your morning blood sugar reading
                          </FormDescription>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nightSugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Night Sugar Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormDescription className="text-[#475569]">
                            Your evening blood sugar reading
                          </FormDescription>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="morningDose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Morning Insulin Dose</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormDescription className="text-[#475569]">
                            Your morning insulin dose
                          </FormDescription>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nightDose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Night Insulin Dose</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormDescription className="text-[#475569]">
                            Your evening insulin dose
                          </FormDescription>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Reading"}
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