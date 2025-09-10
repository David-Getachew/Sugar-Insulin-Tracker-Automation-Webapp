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
import { PlusCircle, Trash2, HelpCircle, Edit, Save, X, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

// Profile form schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
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
  const [savingContact, setSavingContact] = useState<number | null>(null);
  const [showNameSaveMessage, setShowNameSaveMessage] = useState(false);
  const [originalFullName, setOriginalFullName] = useState("");

  const isDemo = profile?.is_demo || false;

  // Helper function to parse secondary emails from "email:relationship" format
  const parseSecondaryEmails = (secondaryEmails: string[] = []) => {
    return secondaryEmails.map(item => {
      const [email, relationship = ''] = item.split(':');
      return {
        name: email?.split('@')[0] || '', // Use email prefix as fallback but allow override
        email: email || '',
        relationship: relationship || ''
      };
    });
  };

  // Helper function to parse telegram IDs with relations
  const parseTelegramIds = (telegramIds: string[] = []) => {
    return telegramIds.map(id => {
      const [handle, label = ''] = id.split(':');
      return {
        handle: handle || '',
        label: label || ''
      };
    });
  };

  const defaultValues: ProfileFormValues = {
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    telegramIds: parseTelegramIds(profile?.telegram_ids),
    secondaryEmails: parseSecondaryEmails(profile?.secondary_emails),
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      const parsedTelegramIds = parseTelegramIds(profile.telegram_ids);
      const parsedSecondaryEmails = parseSecondaryEmails(profile.secondary_emails);
      
      profileForm.reset({
        full_name: profile.full_name,
        email: profile.email,
        telegramIds: parsedTelegramIds,
        secondaryEmails: parsedSecondaryEmails,
      });
      
      setOriginalFullName(profile.full_name);
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
      // Format telegram IDs with relations
      const formattedTelegramIds = values.telegramIds.map(item => 
        item.handle ? `${item.handle}:${item.label || ''}` : ''
      ).filter(Boolean);
      
      await updateProfile({
        full_name: values.full_name,
        telegram_ids: formattedTelegramIds,
        secondary_emails: values.secondaryEmails.filter(contact => 
          contact.email && contact.email.trim() !== ''
        ).map(contact => 
          `${contact.email}:${contact.relationship || ''}` // Format as "email:relationship"
        ),
      });
      
      setOriginalFullName(values.full_name);
      setShowNameSaveMessage(false);
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
    if (isDemo) return;
    setEditingTelegramId(index);
  };

  // Save edited telegram ID
  const saveTelegramId = async (index: number) => {
    if (isDemo) {
      setEditingTelegramId(null);
      return;
    }

    // Validate the form for this specific item
    const telegramIds = profileForm.getValues("telegramIds");
    const currentItem = telegramIds[index];
    
    if (!currentItem.handle) {
      profileForm.setError(`telegramIds.${index}.handle`, {
        type: "manual",
        message: "Telegram ID is required"
      });
      return;
    }

    setSavingContact(index);
    
    try {
      // Format telegram IDs with relations
      const updatedTelegramIds = profileForm.getValues("telegramIds").map(item => 
        item.handle ? `${item.handle}:${item.label || ''}` : ''
      ).filter(Boolean);
      
      await updateProfile({
        telegram_ids: updatedTelegramIds,
        secondary_emails: profileForm.getValues("secondaryEmails").filter(contact => 
          contact.email && contact.email.trim() !== ''
        ).map(contact => 
          `${contact.email}:${contact.relationship || ''}`
        ),
      });
      
      showSuccess("Telegram ID saved successfully");
    } catch (error) {
      console.error("Error saving Telegram ID:", error);
      showError("Failed to save Telegram ID");
    }
    
    setEditingTelegramId(null);
    setSavingContact(null);
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
    if (isDemo) return;
    setEditingSecondaryEmail(index);
  };

  // Save edited secondary contact
  const saveSecondaryEmail = async (index: number) => {
    if (isDemo) {
      setEditingSecondaryEmail(null);
      return;
    }

    // Validate the form for this specific item
    const secondaryEmails = profileForm.getValues("secondaryEmails");
    const currentItem = secondaryEmails[index];
    
    if (!currentItem.name) {
      profileForm.setError(`secondaryEmails.${index}.name`, {
        type: "manual",
        message: "Name is required"
      });
      return;
    }
    
    if (!currentItem.email) {
      profileForm.setError(`secondaryEmails.${index}.email`, {
        type: "manual",
        message: "Email is required"
      });
      return;
    }
    
    try {
      // Validate email format
      const emailSchema = z.string().email();
      emailSchema.parse(currentItem.email);
    } catch {
      profileForm.setError(`secondaryEmails.${index}.email`, {
        type: "manual",
        message: "Please enter a valid email address"
      });
      return;
    }

    setSavingContact(index + 1000); // Use different range for emails
    
    try {
      // Format telegram IDs with relations
      const updatedTelegramIds = profileForm.getValues("telegramIds").map(item => 
        item.handle ? `${item.handle}:${item.label || ''}` : ''
      ).filter(Boolean);
      
      await updateProfile({
        telegram_ids: updatedTelegramIds,
        secondary_emails: profileForm.getValues("secondaryEmails").filter(contact => 
          contact.email && contact.email.trim() !== ''
        ).map(contact => 
          `${contact.email}:${contact.relationship || ''}`
        ),
      });
      
      showSuccess("Secondary email saved successfully");
    } catch (error) {
      console.error("Error saving secondary email:", error);
      showError("Failed to save secondary email");
    }
    
    setEditingSecondaryEmail(null);
    setSavingContact(null);
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    profileForm.setValue("full_name", e.target.value);
    setShowNameSaveMessage(e.target.value !== originalFullName);
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
                            <FormDescription className="text-[#64748b] text-sm">
                              Your full name as it will appear in notifications and reports.
                            </FormDescription>
                            <FormControl>
                              <Input 
                                placeholder="Your name" 
                                {...field} 
                                onChange={handleNameChange}
                                className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                              />
                            </FormControl>
                            {showNameSaveMessage && (
                              <p className="text-sm text-[#0f766e] mt-1">
                                Not saved yet — press Save Changes below to persist this update.
                              </p>
                            )}
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
                            <FormDescription className="text-[#64748b] text-sm">
                              Your primary email address for account access and notifications.
                            </FormDescription>
                            <FormControl>
                              <Input 
                                {...field} 
                                readOnly 
                                className="bg-[#f9fafb] cursor-not-allowed border-[#cbd5e1]"
                              />
                            </FormControl>
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
                          disabled={isDemo}
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
                        <div key={index} className="p-4 border border-[#e2e8f0] rounded-lg bg-white shadow-sm">
                          {editingTelegramId === index ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={profileForm.control}
                                  name={`telegramIds.${index}.handle`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#475569] text-sm">Telegram ID (Required)</FormLabel>
                                      <FormDescription className="text-[#64748b] text-xs">
                                        Unique identifier for this Telegram contact.
                                      </FormDescription>
                                      <FormControl>
                                        <Input 
                                          placeholder="Telegram ID" 
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
                                  name={`telegramIds.${index}.label`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#475569] text-sm">Relation (Optional)</FormLabel>
                                      <FormDescription className="text-[#64748b] text-xs">
                                        Describe your relationship with this contact.
                                      </FormDescription>
                                      <FormControl>
                                        <Input 
                                          placeholder="e.g., Spouse, Doctor" 
                                          {...field} 
                                          className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                        />
                                      </FormControl>
                                      <FormMessage className="text-[#dc2626]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => removeTelegramId(index)}
                                  className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                                <Button 
                                  type="button" 
                                  onClick={() => saveTelegramId(index)}
                                  disabled={savingContact === index}
                                  className="bg-[#0f766e] hover:bg-[#0d5c58] text-white"
                                >
                                  {savingContact === index ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-[#0f172a]">{item.handle}</div>
                                {item.label && (
                                  <div className="text-xs text-[#475569] mt-1">{item.label}</div>
                                )}
                              </div>
                              <div className="flex justify-end space-x-1">
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => startEditingTelegramId(index)}
                                        className="h-8 w-8 text-[#0f766e] hover:bg-transparent"
                                        disabled={isDemo}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit contact</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeTelegramId(index)}
                                        className="h-8 w-8 text-[#dc2626] hover:bg-transparent"
                                        disabled={isDemo}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete contact</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[#0f172a]">Secondary Emails</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addSecondaryContact}
                          className="border-[#0f766e] text-[#0f766e] hover:bg-[#14b8a6] hover:text-white"
                          disabled={isDemo}
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
                        <div key={index} className="p-4 border border-[#e2e8f0] rounded-lg bg-white shadow-sm">
                          {editingSecondaryEmail === index ? (
                            <div className="space-y-4">
                              <FormField
                                control={profileForm.control}
                                name={`secondaryEmails.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[#475569] text-sm">Name (Required)</FormLabel>
                                    <FormDescription className="text-[#64748b] text-xs">
                                      Full name of the contact person.
                                    </FormDescription>
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={profileForm.control}
                                  name={`secondaryEmails.${index}.relationship`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#475569] text-sm">Relation (Optional)</FormLabel>
                                      <FormDescription className="text-[#64748b] text-xs">
                                        Relationship to you (e.g. spouse, child, parent).
                                      </FormDescription>
                                      <FormControl>
                                        <Input 
                                          placeholder="e.g., Spouse, Doctor" 
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
                                  name={`secondaryEmails.${index}.email`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[#475569] text-sm">Email (Required)</FormLabel>
                                      <FormDescription className="text-[#64748b] text-xs">
                                        Valid email address for this contact.
                                      </FormDescription>
                                      <FormControl>
                                        <Input 
                                          placeholder="contact@example.com" 
                                          {...field} 
                                          className="border-[#cbd5e1] focus:ring-[#0f766e] focus:border-[#0f766e]"
                                        />
                                      </FormControl>
                                      <FormMessage className="text-[#dc2626]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => removeSecondaryContact(index)}
                                  className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                                <Button 
                                  type="button" 
                                  onClick={() => saveSecondaryEmail(index)}
                                  disabled={savingContact === index + 1000}
                                  className="bg-[#0f766e] hover:bg-[#0d5c58] text-white"
                                >
                                  {savingContact === index + 1000 ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-5">
                                <div className="text-sm font-medium text-[#0f172a]">{contact.name}</div>
                                {contact.relationship && (
                                  <div className="text-xs text-[#475569] mt-1">{contact.relationship}</div>
                                )}
                              </div>
                              <div className="md:col-span-5">
                                <div className="text-sm text-[#475569]">{contact.email}</div>
                              </div>
                              <div className="md:col-span-2 flex justify-end space-x-1">
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => startEditingSecondaryEmail(index)}
                                        className="h-8 w-8 text-[#0f766e] hover:bg-transparent"
                                        disabled={isDemo}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit contact</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeSecondaryContact(index)}
                                        className="h-8 w-8 text-[#dc2626] hover:bg-transparent"
                                        disabled={isDemo}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete contact</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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