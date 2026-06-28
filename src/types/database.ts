export type UserRole = 'customer' | 'admin'
export type AppointmentStatus = 'requested' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'no_show'
export type ContactStatus = 'open' | 'in_progress' | 'answered' | 'closed'

export interface Profile {
  id: string
  role: UserRole
  email: string
  name: string | null
  phone: string | null
  privacy_agreed_at: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  customer_id: string
  customer_email: string
  customer_phone: string | null
  customer_message: string | null
  scheduled_at: string
  duration: number
  status: AppointmentStatus
  admin_message: string | null
  approved_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  customer_id: string
  customer_email: string
  customer_phone: string | null
  status: ContactStatus
  title: string
  body: string
  admin_reply: string | null
  answered_at: string | null
  created_at: string
  updated_at: string
}

export interface CustomerNote {
  id: string
  customer_id: string
  customer_email: string | null
  customer_phone: string | null
  admin_id: string
  title: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface PublicScheduleItem {
  scheduled_at: string
  duration: number
  label: string
}
