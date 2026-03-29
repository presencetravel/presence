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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
