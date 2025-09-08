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
      const { data, error } = await supabase
        .from('emergency_events') // Changed from 'emergencies' to 'emergency_events'
        .insert({
          ...emergency,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        if (error.code === 'OFFLINE_MODE') {
          showError('Application is in offline mode. Please check your internet connection.');
        } else if (error.message.includes('Network')) {
          showError('Network error. Please check your connection and try again.');
        } else {
          showError(`Failed to save emergency report: ${error.message}`);
        }
        return null;
      }
      
      showSuccess('Emergency report saved successfully');
      return data;
    } catch (error: any) {
      console.error('Error saving emergency:', error);
      if (error.message === 'Offline mode') {
        showError('Application is in offline mode. Please configure your Supabase connection.');
      } else {
        showError('Failed to save emergency report. Please try again.');
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
        .from('emergency_events') // Changed from 'emergencies' to 'emergency_events'
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