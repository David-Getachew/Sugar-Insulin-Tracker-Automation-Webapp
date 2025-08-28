import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { showSuccess } from "@/utils/toast";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  telegramHandles: z.array(
    z.object({
      handle: z.string().min(1, { message: "Telegram handle is required" }),
      label: z.string().optional(),
    })
  ),
  secondaryContacts: z.array(
    z.object({
      name: z.string().min(2, { message: "Name must be at least 2 characters" }),
      email: z.string().email({ message: "Please enter a valid email address" }),
      relationship: z.string().optional(),
    })
  ),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const Profile = () => {
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Mock user data - will be replaced with actual user data from Supabase
  const defaultValues: ProfileFormValues = {
    name: "John Doe",
    email: "john.doe@example.com",
    telegramHandles: [
      { handle: "@johndoe", label: "Personal" }
    ],
    secondaryContacts: [
      { name: "Jane Doe", email: "jane.doe@example.com", relationship: "Doctor" }
    ],
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsProfileLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Profile updated with data:", values);
      showSuccess("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsPasswordLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Password updated");
      showSuccess("Password updated successfully");
      passwordForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Add a new telegram handle field
  const addTelegramHandle = () => {
    const currentHandles = profileForm.getValues("telegramHandles");
    profileForm.setValue("telegramHandles", [
      ...currentHandles,
      { handle: "", label: "" }
    ]);
  };

  // Remove a telegram handle field
  const removeTelegramHandle = (index: number) => {
    const currentHandles = profileForm.getValues("telegramHandles");
    profileForm.setValue("telegramHandles", currentHandles.filter((_, i) => i !== index));
  };

  // Add a new secondary contact field
  const addSecondaryContact = () => {
    const currentContacts = profileForm.getValues("secondaryContacts");
    profileForm.setValue("secondaryContacts", [
      ...currentContacts,
      { name: "", email: "", relationship: "" }
    ]);
  };

  // Remove a secondary contact field
  const removeSecondaryContact = (index: number) => {
    const currentContacts = profileForm.getValues("secondaryContacts");
    profileForm.setValue("secondaryContacts", currentContacts.filter((_, i) => i !== index));
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-[#0f172a]">Profile Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-[#f9fafb]">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-[#0f766e] data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="data-[state=active]:bg-[#0f766e] data-[state=active]:text-white"
            >
              Password
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="bg-white border border-[#e2e8f0]">
              <CardHeader>
                <CardTitle className="text-[#0f766e]">Profile Information</CardTitle>
                <CardDescription className="text-[#475569]">
                  Update your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#475569]">Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your name" 
                                {...field} 
                                className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                              />
                            </FormControl>
                            <FormMessage className="text-[#dc2626]" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#475569]">Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                readOnly 
                                className="bg-[#f9fafb] cursor-not-allowed border-[#cbd5e1]"
                              />
                            </FormControl>
                            <FormDescription className="text-[#475569]">
                              Your email address cannot be changed
                            </FormDescription>
                            <FormMessage className="text-[#dc2626]" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[#0f172a]">Secondary Contacts</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addSecondaryContact}
                          className="border-[#0f766e] text-[#0f766e] hover:bg-[#14b8a6] hover:text-white"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Contact
                        </Button>
                      </div>
                      
                      {profileForm.watch("secondaryContacts").map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border border-[#e2e8f0] rounded-md">
                          <div className="flex justify-between items-center">
                            <div></div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeSecondaryContact(index)}
                              className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                              disabled={profileForm.watch("secondaryContacts").length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-[#dc2626]" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name={`secondaryContacts.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[#475569]">Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Contact name" 
                                      {...field} 
                                      className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-[#dc2626]" />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name={`secondaryContacts.${index}.email`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[#475569]">Email</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Contact email" 
                                      {...field} 
                                      className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-[#dc2626]" />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name={`secondaryContacts.${index}.relationship`}
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel className="text-[#475569]">Relationship (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g. Doctor, Family member" 
                                      {...field} 
                                      className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                    />
                                  </FormControl>
                                  <FormDescription className="text-[#475569]">
                                    Specify the relationship with this contact
                                  </FormDescription>
                                  <FormMessage className="text-[#dc2626]" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-[#0f172a]">Telegram Handles</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-2 text-[#475569]" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-white border border-[#e2e8f0]">
                                <p className="text-[#475569]">
                                  To get your Telegram ID, message the @userinfobot on Telegram. 
                                  The bot will reply with your ID which you can use here.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addTelegramHandle}
                          className="border-[#0f766e] text-[#0f766e] hover:bg-[#14b8a6] hover:text-white"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Handle
                        </Button>
                      </div>
                      
                      {profileForm.watch("telegramHandles").map((_, index) => (
                        <div key={index} className="flex items-end gap-4">
                          <FormField
                            control={profileForm.control}
                            name={`telegramHandles.${index}.handle`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-[#475569]">Handle</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="@username" 
                                    {...field} 
                                    className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                  />
                                </FormControl>
                                <FormMessage className="text-[#dc2626]" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name={`telegramHandles.${index}.label`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-[#475569]">Label (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Personal, Work" 
                                    {...field} 
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
                            onClick={() => removeTelegramHandle(index)}
                            className="mb-2 hover:bg-[#14b8a6] hover:text-[#0f766e]"
                            disabled={profileForm.watch("telegramHandles").length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-[#dc2626]" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button type="submit" disabled={isProfileLoading}>
                      {isProfileLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card className="bg-white border border-[#e2e8f0]">
              <CardHeader>
                <CardTitle className="text-[#0f766e]">Change Password</CardTitle>
                <CardDescription className="text-[#475569]">
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Current Password</FormLabel>
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
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                            />
                          </FormControl>
                          <FormDescription className="text-[#475569]">
                            Password must be at least 6 characters long
                          </FormDescription>
                          <FormMessage className="text-[#dc2626]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#475569]">Confirm New Password</FormLabel>
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
                    
                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;