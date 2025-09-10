export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string // This will come from auth user, not stored in profiles table
  is_demo: boolean
  telegram_ids: string[]
  secondary_emails: string[] // Format: "email:relationship"
  created_at: string
  updated_at: string
}

export interface DailyReading {
  id: string
  user_id: string
  date: string
  sugar_morning: number
  sugar_night: number
  insulin_morning: number
  insulin_night: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Emergency {
  id: string
  user_id: string
  event_date: string
  event_time: string
  sugar_level: number
  symptoms: string
  actions_taken?: string
  notes?: string
  created_at: string
}

export interface EmergencyMedication {
  id: string
  event_id: string
  med_name: string
  dose: number
  created_at: string
}