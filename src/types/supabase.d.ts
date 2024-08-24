import { Database as SupabaseDatabase } from "@supabase/supabase-js";

export interface Database extends SupabaseDatabase {
  public: {
    Tables: {
      anonymous_users: {
        Row: {
          id: string;
          ip_address: string;
          transcriptions_used: number;
          quota_remaining: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_address: string;
          transcriptions_used?: number;
          quota_remaining?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_address?: string;
          transcriptions_used?: number;
          quota_remaining?: number;
          created_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          url: string;
          title: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id: string;
          url: string;
          title?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
      summaries: {
        Row: {
          id: number;
          video_id: string;
          content: string;
          transcript: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: number;
          video_id: string;
          content: string;
          transcript: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: number;
          video_id?: string;
          content?: string;
          transcript?: string;
          created_at?: string;
          user_id?: string;
        };
      };
      transcriptions: {
        Row: {
          id: number;
          video_id: string;
          content: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: number;
          video_id: string;
          content: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: number;
          video_id?: string;
          content?: string;
          created_at?: string;
          user_id?: string;
        };
      };
      pricing_plans: {
        Row: {
          id: number;
          name: string;
          price: number;
          quota: number;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          quota: number;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          quota?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
