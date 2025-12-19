import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



// Types for database tables
export type Product = {
  id: string
  slug: string
  name: string
  category: string
  price_per_day: number
  price_per_trip: number
  stock: number
  image: string
  description: string
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string | null
  customer_identity: string | null
  start_date: string
  end_date: string
  total_days: number
  subtotal: number
  discount_code: string | null
  discount_amount: number
  total: number
  payment_method: string
  payment_status: string
  booking_status: string
  snap_token: string | null
  created_at: string
  updated_at: string
}

export type BookingItem = {
  id: string
  booking_id: string
  product_id: string
  quantity: number
  price_per_trip: number
  created_at: string
}

export type Review = {
  id: string
  product_id: string
  customer_name: string
  rating: number
  comment: string | null
  created_at: string
}
