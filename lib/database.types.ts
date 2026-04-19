export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          school: string | null;
          sport: string | null;
          home_airport: string | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          school?: string | null;
          sport?: string | null;
          home_airport?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          school?: string | null;
          sport?: string | null;
          home_airport?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_requests: {
        Row: {
          id: string;
          created_at: string;
          athlete_id: string;
          traveler_name: string;
          traveler_phone: string;
          trip_date: string;
          status: string;
          selected_offer_id: string | null;
          selected_offer_data: Json | null;
          total_amount: number | null;
          traveler_info: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          athlete_id: string;
          traveler_name: string;
          traveler_phone: string;
          trip_date: string;
          status?: string;
          selected_offer_id?: string | null;
          selected_offer_data?: Json | null;
          total_amount?: number | null;
          traveler_info?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          athlete_id?: string;
          traveler_name?: string;
          traveler_phone?: string;
          trip_date?: string;
          status?: string;
          selected_offer_id?: string | null;
          selected_offer_data?: Json | null;
          total_amount?: number | null;
          traveler_info?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "trip_requests_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};