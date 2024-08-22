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
        }
        Insert: {
          id?: string
          created_at?: string | null
          video_url?: string | null
          transcription?: string | null
          summary?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          video_url?: string | null
          transcription?: string | null
          summary?: string | null
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