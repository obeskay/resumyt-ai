export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      pricing_plans: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number | null;
          quota_limit: number;
          features: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          price?: number | null;
          quota_limit: number;
          features?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          price?: number | null;
          quota_limit?: number;
          features?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      anonymous_users: {
        Row: {
          id: string;
          ip_address: string;
          transcriptions_used: number | null;
          quota_remaining: number | null;
          pricing_plan_id: number | null;
          created_at: string;
          plan_type: string | null;
          quota_limit: number | null;
          quota_reset_date: string | null;
        };
        Insert: {
          id?: string;
          ip_address: string;
          transcriptions_used?: number | null;
          quota_remaining?: number | null;
          pricing_plan_id?: number | null;
          created_at?: string;
          plan_type?: string | null;
          quota_limit?: number | null;
          quota_reset_date?: string | null;
        };
        Update: {
          id?: string;
          ip_address?: string;
          transcriptions_used?: number | null;
          quota_remaining?: number | null;
          pricing_plan_id?: number | null;
          created_at?: string;
          plan_type?: string | null;
          quota_limit?: number | null;
          quota_reset_date?: string | null;
        };
      };
      summaries: {
        Row: {
          id: number;
          video_id: string | null;
          title: string | null;
          content: string;
          transcript: string;
          format: string;
          created_at: string;
          user_id: string | null;
          suggested_questions: Json | null;
        };
        Insert: {
          id?: number;
          video_id?: string | null;
          title?: string | null;
          content: string;
          transcript: string;
          format: string;
          created_at?: string;
          user_id?: string | null;
          suggested_questions?: Json | null;
        };
        Update: {
          id?: number;
          video_id?: string | null;
          title?: string | null;
          content?: string;
          transcript?: string;
          format?: string;
          created_at?: string;
          user_id?: string | null;
          suggested_questions?: Json | null;
        };
      };
      videos: {
        Row: {
          id: string;
          url: string;
          title: string | null;
          thumbnail_url: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id: string;
          url: string;
          title?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
    };
  };
}
