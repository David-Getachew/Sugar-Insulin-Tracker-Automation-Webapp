import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DailyReading, Emergency } from '@/types/database'
import { showError, showSuccess } from '@/utils/toast'

export const useDatabase = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Function to check table schema
  const checkTableSchema = useCallback(async (tableName: string) => {
    try {
      console.log(`Checking schema for table: ${tableName}`);
      
      // First, try to get the table structure by selecting with a limit
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`Schema check error for ${tableName}:`, error);
        showError(`Table check failed: ${error.message}`);
        return null;
      }
      
      console.log(`Schema sample for ${tableName}:`, data);
      return data;
    } catch (error) {
      console.error(`Error checking schema for ${tableName}:`, error);
      return null;
    }
  }, []);

  const getDailyReadings = useCallback(async (): Promise<DailyReading[]> => {
    if (!user) throw new Error('User not authenticated')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching daily readings:', error)
      showError('Failed to load daily readings')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const createDailyReading = useCallback(async (reading: Omit<DailyReading, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user) {
      showError('Please log in to save readings');
      return false;
    }
    
    setLoading(true);
    try {
      console.log('Attempting to save daily reading:', {
        ...reading,
        user_id: user.id,
      });
      
      const { error } = await supabase
        .from('daily_readings')
        .upsert({
          ...reading,
          user_id: user.id,
          // Update edited_date when overwriting
          edited_date: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error('Database error:', error);
        showError(`Database error: ${error.message}`);
        return false;
      }
      
      showSuccess('Daily reading saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving daily reading:', error);
      showError('Failed to save daily reading. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createEmergency = useCallback(async (emergency: Omit<Emergency, 'id' | 'user_id' | 'created_at'>): Promise<Emergency | null> => {
    if (!user) {
      showError('Please log in to save emergency reports');
      return null;
    }
    
    setLoading(true);
    try {
      // Pass data as arrays directly since the database expects arrays, not JSON strings
      const emergencyData = {
        ...emergency,
        user_id: user.id,
        // Keep symptoms and actions_taken as arrays since the DB expects arrays
        symptoms: emergency.symptoms,
        actions_taken: emergency.actions_taken
      };

      console.log('Inserting emergency data:', emergencyData);

      const { data, error } = await supabase
        .from('emergency_events')
        .insert(emergencyData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        if (error.code === 'OFFLINE_MODE') {
          showError('Application is in offline mode. Please check your internet connection.');
        } else if (error.message.includes('Network')) {
          showError('Network error. Please check your connection and try again.');
        } else if (error.message.includes('malformed array literal')) {
          showError('Database error: Array formatting issue. Error details: ' + error.message);
        } else {
          showError(`Failed to save emergency report: ${error.message}`);
        }
        return null;
      }
      
      // Send webhook after successful insertion using the inserted row data
      if (data) {
        const webhookUrl = import.meta.env.VITE_N8N_EMERGENCY_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            // Format the data as required - the data from DB should already be in the correct format
            const webhookData = {
              ...data,
              // Keep symptoms and actions_taken as arrays since the DB stores them as arrays
              symptoms: data.symptoms,
              actions_taken: data.actions_taken
            };
            
            const webhookPayload = {
              record: webhookData,
              timestamp: new Date().toISOString()
            };
            
            console.log('Sending webhook payload:', webhookPayload);
            
            // Helper function for webhook POST with retry
            const postToWebhook = async (url: string, body: any) => {
              // First attempt
              let response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-webhook-secret': '4sD8fJk9PqZ!vT2LmN6xW'  // Add the webhook secret header
                },
                body: JSON.stringify(body)
              });
              
              // Retry once on network failure
              if (!response.ok) {
                console.log('First webhook attempt failed, retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-webhook-secret': '4sD8fJk9PqZ!vT2LmN6xW'  // Add the webhook secret header
                  },
                  body: JSON.stringify(body)
                });
              }
              
              return response;
            };
            
            const response = await postToWebhook(webhookUrl, webhookPayload);
            
            if (!response.ok) {
              console.error('Webhook delivery failed after retry:', response.status, response.statusText);
              showError("Webhook delivery failed, but report saved.");
            } else {
              // Log response in dev mode
              if (import.meta.env.DEV) {
                const responseBody = await response.text();
                console.log('Emergency notification sent to N8N webhook. Status:', response.status, 'Response:', responseBody);
              } else {
                console.log('Emergency notification sent to N8N webhook. Status:', response.status);
              }
            }
          } catch (webhookError: any) {
            console.error('Failed to send emergency notification:', webhookError);
            showError("Webhook delivery failed, but report saved.");
          }
        }
      }
      
      showSuccess('Emergency report saved successfully');
      return data;
    } catch (error: any) {
      console.error('Error saving emergency:', error);
      if (error.message === 'Offline mode') {
        showError('Application is in offline mode. Please configure your Supabase connection.');
      } else {
        showError('Failed to save emergency report: ' + (error.message || 'Unknown error'));
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getEmergencies = useCallback(async (): Promise<Emergency[]> => {
    if (!user) throw new Error('User not authenticated')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching emergencies:', error)
      showError('Failed to load emergency records')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const saveMedications = useCallback(async (eventId: string, medications: { name: string; dose: number }[]): Promise<boolean> => {
    if (!user) {
      showError('Please log in to save medications');
      return false;
    }
    
    try {
      const medicationData = medications.map(med => ({
        event_id: eventId,
        med_name: med.name,
        dose: med.dose,
      }));
      
      console.log('Saving medications:', medicationData);
      
      const { error } = await supabase
        .from('emergency_medications')
        .insert(medicationData);

      if (error) {
        console.error('Database error saving medications:', error);
        showError(`Failed to save medications: ${error.message}`);
        return false;
      }
      
      console.log('Medications saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving medications:', error);
      showError('Failed to save medications. Please try again.');
      return false;
    }
  }, [user]);

  return {
    loading,
    getDailyReadings,
    createDailyReading,
    createEmergency,
    getEmergencies,
    saveMedications,
    checkTableSchema,
  }
}