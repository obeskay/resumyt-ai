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
          price: number;
          quota: number;
          features: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          quota: number;
          features: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          quota?: number;
          features?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
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
        Relationships: [
          {
            foreignKeyName: "anonymous_users_pricing_plan_id_fkey";
            columns: ["pricing_plan_id"];
            referencedRelation: "pricing_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      videos: {
        Row: {
          id: string;
          url: string;
          title: string | null;
          thumbnail_url: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id: string;
          url: string;
          title?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "anonymous_users";
            referencedColumns: ["id"];
          }
        ];
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
          user_id: string;
        };
        Insert: {
          id?: number;
          video_id?: string | null;
          title?: string | null;
          content: string;
          transcript: string;
          format: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: number;
          video_id?: string | null;
          title?: string | null;
          content?: string;
          transcript?: string;
          format?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "summaries_video_id_fkey";
            columns: ["video_id"];
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "summaries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "anonymous_users";
            referencedColumns: ["id"];
          }
        ];
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
