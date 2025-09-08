import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DailyReading, Emergency } from '@/types/database'
import { showError, showSuccess } from '@/utils/toast'

export const useDatabase = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const getDailyReadings = useCallback(async (): Promise<DailyReading[]> => {
    if (!user) throw new Error('User not authenticated')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching daily readings:', error)
      showError('Failed to load daily readings')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const createDailyReading = useCallback(async (reading: Omit<DailyReading, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated')
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('daily_readings')
        .upsert({
          ...reading,
          user_id: user.id,
        }, {
          onConflict: 'user_id,date'
        })

      if (error) throw error
      
      showSuccess('Daily reading saved successfully')
      return true
    } catch (error) {
      console.error('Error saving daily reading:', error)
      showError('Failed to save daily reading')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const createEmergency = useCallback(async (emergency: Omit<Emergency, 'id' | 'user_id' | 'created_at'>): Promise<Emergency | null> => {
    if (!user) throw new Error('User not authenticated')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .insert({
          ...emergency,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      
      showSuccess('Emergency report saved successfully')
      return data
    } catch (error) {
      console.error('Error saving emergency:', error)
      showError('Failed to save emergency report')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const getEmergencies = useCallback(async (): Promise<Emergency[]> => {
    if (!user) throw new Error('User not authenticated')
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('emergencies')
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

  return {
    loading,
    getDailyReadings,
    createDailyReading,
    createEmergency,
    getEmergencies,
  }
}