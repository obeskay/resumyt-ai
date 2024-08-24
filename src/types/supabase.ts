import { SupabaseClient } from '@supabase/supabase-js'

export type Tables = Supabase.Database['public']['Tables']

export type PricingPlan = Tables['pricing_plans']['Row']
export type AnonymousUser = Tables['anonymous_users']['Row']
export type Video = Tables['videos']['Row']
export type Summary = Tables['summaries']['Row']
export type Transcription = Tables['transcriptions']['Row']

export type AnonymousUserInsert = Tables['anonymous_users']['Insert']
export type SummaryInsert = Tables['summaries']['Insert']

export type DatabaseError = {
  code: string;
  details: string;
  hint: string;
  message: string;
}

declare global {
  namespace Supabase {
    interface Database {
      public: {
        Tables: {
          pricing_plans: {
            Row: {
              id: number
              name: string
              price: number
              quota: number
              features: Record<string, string>
              created_at: string
            }
            Insert: {
              id?: number
              name: string
              price: number
              quota: number
              features: Record<string, string>
              created_at?: string
            }
            Update: {
              id?: number
              name?: string
              price?: number
              quota?: number
              features?: Record<string, string>
              created_at?: string
            }
          }
          anonymous_users: {
            Row: {
              id: string
              ip_address: string
              transcriptions_used: number
              quota_remaining: number
              pricing_plan_id: number
              created_at: string
            }
            Insert: {
              id?: string
              ip_address: string
              transcriptions_used?: number
              quota_remaining?: number
              pricing_plan_id?: number
              created_at?: string
            }
            Update: {
              id?: string
              ip_address?: string
              transcriptions_used?: number
              quota_remaining?: number
              pricing_plan_id?: number
              created_at?: string
            }
          }
          videos: {
            Row: {
              id: string
              url: string
              title: string | null
              created_at: string
              user_id: string
            }
            Insert: {
              id: string
              url: string
              title?: string | null
              created_at?: string
              user_id: string
            }
            Update: {
              id?: string
              url?: string
              title?: string | null
              created_at?: string
              user_id?: string
            }
          }
          summaries: {
            Row: {
              id: number
              video_id: string | null
              content: string
              transcript: string
              created_at: string
              user_id: string
            }
            Insert: {
              id?: number
              video_id?: string | null
              content: string
              transcript: string
              created_at?: string
              user_id: string
            }
            Update: {
              id?: number
              video_id?: string | null
              content?: string
              transcript?: string
              created_at?: string
              user_id?: string
            }
          }
          transcriptions: {
            Row: {
              id: number
              video_id: string | null
              content: string
              created_at: string
              user_id: string
            }
            Insert: {
              id?: number
              video_id?: string | null
              content: string
              created_at?: string
              user_id: string
            }
            Update: {
              id?: number
              video_id?: string | null
              content?: string
              created_at?: string
              user_id?: string
            }
          }
        }
      }
    }
  }
}
