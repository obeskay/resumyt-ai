export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pricing_plans: {
        Row: {
          id: number
          name: string
          price: number
          quota: number
          features: Json
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          quota: number
          features: Json
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          quota?: number
          features?: Json
          created_at?: string
        }
        Relationships: []
      }
      anonymous_users: {
            Row: {
              id: string;
              ip_address: string;
              transcriptions_used: number;
              quota_remaining: number;
              pricing_plan_id: number;
              created_at: string;
            };
            Insert: {
              id?: string;
              ip_address: string;
              transcriptions_used?: number;
              quota_remaining?: number;
              pricing_plan_id?: number;
              created_at?: string;
            };
            Update: {
              id?: string;
              ip_address?: string;
              transcriptions_used?: number;
              quota_remaining?: number;
              pricing_plan_id?: number;
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
              video_id: string | null;
              content: string;
              transcript: string;
              created_at: string;
              user_id: string;
            };
            Insert: {
              id?: number;
              video_id?: string | null;
              content: string;
              transcript: string;
              created_at?: string;
              user_id: string;
            };
            Update: {
              id?: number;
              video_id?: string | null;
              content?: string;
              transcript?: string;
              created_at?: string;
              user_id?: string;
            };
          };
          transcriptions: {
            Row: {
              id: number;
              video_id: string | null;
              content: string;
              created_at: string;
              user_id: string;
            };
            Insert: {
              id?: number;
              video_id?: string | null;
              content: string;
              created_at?: string;
              user_id: string;
            };
            Update: {
              id?: number;
              video_id?: string | null;
              content?: string;
              created_at?: string;
              user_id?: string;
            };
          };
        };
      };
    }
  }
