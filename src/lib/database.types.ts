export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export enum AuthRoleEnum {
  ANONYMOUS = 'anonymous',
  USER = 'user',
  ADMIN = 'admin',
  // ... otros roles si es necesario
}

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          created_at: string | null
          video_url: string | null
          transcription: string | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          video_url?: string | null
          transcription?: string | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          video_url?: string | null
          transcription?: string | null
          summary?: string | null
          user_id?: string | null
        }
      }
      anonymous_users: {
        Row: {
          id: string
          ip_address: string
          transcriptions_used: number
          created_at: string
        }
        Insert: {
          id?: string
          ip_address: string
          transcriptions_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          ip_address?: string
          transcriptions_used?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      summarize_text: {
        Args: { text: string }
        Returns: { summary: string }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type AnonymousUser = Database['public']['Tables']['anonymous_users']['Row']
