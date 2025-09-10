import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: import.meta.env.DEMO_USER_EMAIL || "",
      password: import.meta.env.DEMO_USER_PASSWORD || "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const result = await signIn(values.email, values.password);
      
      if (result.success) {
        showSuccess("Login successful");
        navigate("/dashboard");
      } else {
        showError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      showError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <Card className="w-full max-w-md bg-white border border-[#e2e8f0]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#0f766e]">Sugar & Insulin Tracker</CardTitle>
          <CardDescription className="text-center text-[#475569]">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#475569]">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        {...field} 
                        className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                      />
                    </FormControl>
                    <FormMessage className="text-[#dc2626]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#475569]">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                      />
                    </FormControl>
                    <FormMessage className="text-[#dc2626]" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-[#475569]">
            Contact your administrator if you need access to the system.
          </p>
          <p className="text-xs text-center text-[#475569]">
            For demo: use your demo account credentials from .env file
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;