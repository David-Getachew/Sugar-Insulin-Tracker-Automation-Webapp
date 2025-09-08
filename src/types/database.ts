export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  is_demo: boolean
  telegram_ids: string[]
  secondary_contacts: {
    name: string
    email: string
    relationship?: string
  }[]
  created_at: string
  updated_at: string
}

export interface DailyReading {
  id: string
  user_id: string
  date: string
  morning_sugar: number
  night_sugar: number
  morning_dose: number
  night_dose: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Emergency {
  id: string
  user_id: string
  date: string
  time: string
  sugar_level: number
  symptoms: string
  actions_taken?: string
  medications_given?: {
    name: string
    dose: number
  }[]
  notes?: string
  created_at: string
}