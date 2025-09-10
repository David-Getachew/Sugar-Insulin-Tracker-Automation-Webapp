import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, HelpCircle, Edit, Save, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

// Profile form schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  // Email is read-only, so we make it optional for validation but still include it
  email: z.string().optional(),
  telegramIds: z.array(
    z.object({
      handle: z.string().min(1, { message: "Telegram ID is required" }),
      label: z.string().optional(),
    })
  ).min(0),
  secondaryEmails: z.array(
    z.object({
      name: z.string().min(2, { message: "Name must be at least 2 characters" }),
      email: z.string().email({ message: "Please enter a valid email address" }),
      relationship: z.string().optional(),
    })
  ).min(0),
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
  const { profile, updateProfile, changePassword } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [editingTelegramId, setEditingTelegramId] = useState<number | null>(null);
  const [editingSecondaryEmail, setEditingSecondaryEmail] = useState<number | null>(null);

  const isDemo = profile?.is_demo || false;

  // Helper function to parse secondary emails from "email:relationship" format
  const parseSecondaryEmails = (secondaryEmails: string[] = []) => {
    return secondaryEmails.map(item => {
      const [email, relationship = ''] = item.split(':');
      return {
        name: email?.split('@')[0] || '', // Use email prefix as display name
        email: email || '',
        relationship: relationship || ''
      };
    });
  };

  // Default values with empty arrays (no default values)
  const defaultValues: ProfileFormValues = {
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    telegramIds: profile?.telegram_ids?.map(id => ({ handle: id, label: "" })) || [],
    secondaryEmails: parseSecondaryEmails(profile?.secondary_emails),
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name,
        email: profile.email,
        telegramIds: profile.telegram_ids?.map(id => ({ handle: id, label: "" })) || [],
        secondaryEmails: parseSecondaryEmails(profile.secondary_emails),
      });
    }
  }, [profile, profileForm]);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (isDemo) {
      showSuccess("Demo mode: Profile changes not saved");
      return;
    }

    setIsProfileLoading(true);
    
    try {
      await updateProfile({
        full_name: values.full_name,
        telegram_ids: values.telegramIds.map(item => item.handle).filter(Boolean),
        secondary_emails: values.secondaryEmails.filter(contact => 
          contact.email && contact.email.trim() !== ''
        ).map(contact => 
          `${contact.email}:${contact.relationship || ''}` // Format as "email:relationship"
        ),
      });
      
      showSuccess("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Failed to update profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (isDemo) {
      showSuccess("Demo mode: Password changes not allowed");
      return;
    }

    setIsPasswordLoading(true);
    
    try {
      // Use the new changePassword function from AuthContext
      const result = await changePassword(values.newPassword);
      
      if (result.success) {
        showSuccess("Password updated successfully");
        passwordForm.reset();
      } else {
        showError(result.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      showError("An error occurred while updating password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Add a new telegram ID field
  const addTelegramId = () => {
    const currentIds = profileForm.getValues("telegramIds");
    profileForm.setValue("telegramIds", [
      ...currentIds,
      { handle: "", label: "" }
    ]);
    setEditingTelegramId(currentIds.length);
  };

  // Remove a telegram ID field
  const removeTelegramId = (index: number) => {
    const currentIds = profileForm.getValues("telegramIds");
    profileForm.setValue("telegramIds", currentIds.filter((_, i) => i !== index));
    if (editingTelegramId === index) {
      setEditingTelegramId(null);
    } else if (editingTelegramId !== null && editingTelegramId > index) {
      setEditingTelegramId(editingTelegramId - 1);
    }
  };

  // Start editing a telegram ID
  const startEditingTelegramId = (index: number) => {
    setEditingTelegramId(index);
  };

  // Save edited telegram ID
  const saveTelegramId = (index: number) => {
    setEditingTelegramId(null);
  };

  // Add a new secondary contact field
  const addSecondaryContact = () => {
    const currentContacts = profileForm.getValues("secondaryEmails");
    profileForm.setValue("secondaryEmails", [
      ...currentContacts,
      { name: "", email: "", relationship: "" }
    ]);
    setEditingSecondaryEmail(currentContacts.length);
  };

  // Remove a secondary contact field
  const removeSecondaryContact = (index: number) => {
    const currentContacts = profileForm.getValues("secondaryEmails");
    profileForm.setValue("secondaryEmails", currentContacts.filter((_, i) => i !== index));
    if (editingSecondaryEmail === index) {
      setEditingSecondaryEmail(null);
    } else if (editingSecondaryEmail !== null && editingSecondaryEmail > index) {
      setEditingSecondaryEmail(editingSecondaryEmail - 1);
    }
  };

  // Start editing a secondary contact
  const startEditingSecondaryEmail = (index: number) => {
    setEditingSecondaryEmail(index);
  };

  // Save edited secondary contact
  const saveSecondaryEmail = (index: number) => {
    setEditingSecondaryEmail(null);
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
                  <strong>Demo Account — Read-Only:</strong> Profile changes will not be saved to the database.
                </p>
              </div>
            </div>
          </div>
        )}
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
                        name="full_name"
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
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-[#0f172a]">Telegram IDs (for daily summaries)</h3>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-2 text-[#475569] cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent 
                                className="max-w-xs bg-white border border-[#e2e8f0]" 
                                side="right"
                              >
                                <p className="text-[#475569]">
                                  To get your Telegram ID, message <a 
                                    href="https://t.me/userinfobot" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#0f766e] hover:underline font-medium"
                                  >
                                    @userinfobot
                                  </a>. The bot will reply with your ID which you can use here.
                                  These contacts will receive daily summaries of your readings.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addTelegramId}
                          className="border-[#0f766e] text-[#0f766e] hover:bg-[#14b8a6] hover:text-white"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add ID
                        </Button>
                      </div>
                      
                      {profileForm.watch("telegramIds").length === 0 && (
                        <div className="text-sm text-[#475569] italic">
                          No Telegram IDs added. Add at least one ID or a secondary contact to receive daily summaries.
                        </div>
                      )}
                      
                      {profileForm.watch("telegramIds").map((item, index) => (
                        <div key={index} className="p-3 border border-[#e2e8f0] rounded-md">
                          {editingTelegramId === index ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <div className="md:col-span-5">
                                <FormField
                                  control={profileForm.control}
                                  name={`telegramIds.${index}.label`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#475569] text-xs">Relation (Optional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Relation" 
                                          {...field} 
                                          className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                        />
                                      </FormControl>
                                      <FormDescription className="text-[#475569] text-xs">
                                        Describe your relationship with this contact
                                      </FormDescription>
                                      <FormMessage className="text-[#dc2626]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="md:col-span-6">
                                <FormField
                                  control={profileForm.control}
                                  name={`telegramIds.${index}.handle`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#475569] text-xs">Telegram ID (Required)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Telegram ID" 
                                          {...field} 
                                          className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                        />
                                      </FormControl>
                                      <FormDescription className="text-[#475569] text-xs">
                                        Unique identifier for this Telegram contact
                                      </FormDescription>
                                      <FormMessage className="text-[#dc2626]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="md:col-span-1 flex items-end justify-center">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => saveTelegramId(index)}
                                  className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                                >
                                  <Save className="h-4 w-4 text-[#0f766e]" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[#0f172a] truncate">
                                  {item.handle}
                                </div>
                                {item.label && (
                                  <div className="text-sm text-[#475569] truncate">
                                    {item.label}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => startEditingTelegramId(index)}
                                  className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                                >
                                  <Edit className="h-4 w-4 text-[#0f766e]" />
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeTelegramId(index)}
                                  className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                                >
                                  <Trash2 className="h-4 w-4 text-[#dc2626]" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[#0f172a]">Secondary Emails (for daily summaries)</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addSecondaryContact}
                          className="border-[#0f766e] text-[#0f766e] hover:bg-[#14b8a6] hover:text-white"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Email
                        </Button>
                      </div>
                      
                      {profileForm.watch("secondaryEmails").length === 0 && (
                        <div className="text-sm text-[#475569] italic">
                          No secondary emails added. Add at least one email or a Telegram ID to receive daily summaries.
                        </div>
                      )}
                      
                      {profileForm.watch("secondaryEmails").map((contact, index) => (
                        <div key={index} className="p-3 border border-[#e2e8f0] rounded-md">
                          {editingSecondaryEmail === index ? (
                            <div className="space-y-2">
                              <FormField
                                control={profileForm.control}
                                name={`secondaryEmails.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[#475569] text-xs">Name (Required)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Name" 
                                        {...field} 
                                        className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                      />
                                    </FormControl>
                                    <FormDescription className="text-[#475569] text-xs">
                                      Full name of the contact person
                                    </FormDescription>
                                    <FormMessage className="text-[#dc2626]" />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                <div className="md:col-span-5">
                                  <FormField
                                    control={profileForm.control}
                                    name={`secondaryEmails.${index}.relationship`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[#475569] text-xs">Relation (Optional)</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="Relation" 
                                            {...field} 
                                            className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e] text-sm"
                                          />
                                        </FormControl>
                                        <FormDescription className="text-[#475569] text-xs">
                                          Relationship to you (e.g. spouse, child, parent)
                                        </FormDescription>
                                        <FormMessage className="text-[#dc2626]" />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="md:col-span-6">
                                  <FormField
                                    control={profileForm.control}
                                    name={`secondaryEmails.${index}.email`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[#475569] text-xs">Email (Required)</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="Email" 
                                            {...field} 
                                            className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                          />
                                        </FormControl>
                                        <FormDescription className="text-[#475569] text-xs">
                                          Valid email address for this contact
                                        </FormDescription>
                                        <FormMessage className="text-[#dc2626]" />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="md:col-span-1 flex items-end justify-center">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => saveSecondaryEmail(index)}
                                    className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                                  >
                                    <Save className="h-4 w-4 text-[#0f766e]" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[#0f172a] truncate">
                                  {contact.name}
                                </div>
                                <div className="text-sm text-[#475569] truncate">
                                  {contact.email}
                                </div>
                                {contact.relationship && (
                                  <div className="text-xs text-[#64748b] truncate">
                                    {contact.relationship}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => startEditingSecondaryEmail(index)}
                                  className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                                >
                                  <Edit className="h-4 w-4 text-[#0f766e]" />
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeSecondaryContact(index)}
                                  className="hover:bg-[#14b8a6] hover:text-[#0f766e]"
                                >
                                  <Trash2 className="h-4 w-4 text-[#dc2626]" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Button type="submit" disabled={isProfileLoading || isDemo}>
                      {isDemo ? "Demo Mode - Read Only" : (isProfileLoading ? "Saving..." : "Save Changes")}
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
                    
                    <Button type="submit" disabled={isPasswordLoading || isDemo}>
                      {isDemo ? "Demo Mode - Read Only" : (isPasswordLoading ? "Updating..." : "Update Password")}
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