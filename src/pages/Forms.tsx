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
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  morningSugar: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
  nightSugar: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
  morningDose: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
  nightDose: z.coerce.number().min(0, { message: "Value must be positive" }).optional(),
}).refine(data => {
  // At least one field must be filled
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
      morningSugar: undefined,
      nightSugar: undefined,
      morningDose: undefined,
      nightDose: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // This is where we would submit to Supabase in the real implementation
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add user_id (this would come from auth context in the real implementation)
      const dataToSubmit = {
        ...values,
        user_id: "mock-user-id-123",
        created_at: new Date().toISOString(),
      };
      
      console.log("Form submitted with data:", dataToSubmit);
      
      showSuccess("Reading submitted successfully");
      setIsSubmitted(true);
      
      // Reset form
      form.reset();
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
        <h1 className="text-2xl font-bold tracking-tight mb-6">Submit New Readings</h1>
        
        {isSubmitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Reading Submitted</CardTitle>
              <CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>New Reading</CardTitle>
              <CardDescription>
                Enter your sugar levels and insulin doses for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="morningSugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Morning Sugar Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your morning blood sugar reading
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nightSugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Night Sugar Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your evening blood sugar reading
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="morningDose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Morning Insulin Dose</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your morning insulin dose
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nightDose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Night Insulin Dose</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter value" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your evening insulin dose
                          </FormDescription>
                          <FormMessage />
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