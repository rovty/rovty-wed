// Hand-updated to match supabase/migrations/20260904000000_multi_tenant.sql.
// Regenerate with `supabase gen types typescript` once this project has a
// live Supabase connection — this file just needs to compile correctly
// until then.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      weddings: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          bride: string;
          groom: string;
          event_date: string;
          event_end: string | null;
          reception_date: string | null;
          reception_end: string | null;
          venue: string | null;
          hall: string | null;
          address: string | null;
          description: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          bride: string;
          groom: string;
          event_date: string;
          event_end?: string | null;
          reception_date?: string | null;
          reception_end?: string | null;
          venue?: string | null;
          hall?: string | null;
          address?: string | null;
          description?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          bride?: string;
          groom?: string;
          event_date?: string;
          event_end?: string | null;
          reception_date?: string | null;
          reception_end?: string | null;
          venue?: string | null;
          hall?: string | null;
          address?: string | null;
          description?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          wedding_id: string;
          code: string;
          created_at: string;
          name: string;
          seats: number;
          title: string | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          code: string;
          created_at?: string;
          name: string;
          seats?: number;
          title?: string | null;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          code?: string;
          created_at?: string;
          name?: string;
          seats?: number;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          },
        ];
      };
      rsvps: {
        Row: {
          id: string;
          wedding_id: string;
          attending: boolean;
          created_at: string;
          guest_code: string;
          message: string | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          attending: boolean;
          created_at?: string;
          guest_code: string;
          message?: string | null;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          attending?: boolean;
          created_at?: string;
          guest_code?: string;
          message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_wedding_id_guest_code_fkey";
            columns: ["wedding_id", "guest_code"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["wedding_id", "code"];
          },
        ];
      };
      seating_config: {
        Row: {
          wedding_id: string;
          published: boolean;
          updated_at: string;
        };
        Insert: {
          wedding_id: string;
          published?: boolean;
          updated_at?: string;
        };
        Update: {
          wedding_id?: string;
          published?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seating_config_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: true;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          },
        ];
      };
      seating_tables: {
        Row: {
          id: string;
          wedding_id: string;
          table_number: number;
          table_name: string | null;
          capacity: number;
          map_x: number;
          map_y: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          table_number: number;
          table_name?: string | null;
          capacity?: number;
          map_x?: number;
          map_y?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          table_number?: number;
          table_name?: string | null;
          capacity?: number;
          map_x?: number;
          map_y?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seating_tables_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          },
        ];
      };
      seating_assignments: {
        Row: {
          id: string;
          wedding_id: string;
          guest_code: string;
          table_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          guest_code: string;
          table_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          guest_code?: string;
          table_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seating_assignments_wedding_id_guest_code_fkey";
            columns: ["wedding_id", "guest_code"];
            isOneToOne: true;
            referencedRelation: "guests";
            referencedColumns: ["wedding_id", "code"];
          },
          {
            foreignKeyName: "seating_assignments_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "seating_tables";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_guest_by_code: {
        Args: { _slug: string; _code: string };
        Returns: {
          code: string;
          name: string;
          seats: number;
          title: string;
        }[];
      };
      get_seating_by_code: {
        Args: { _slug: string; _code: string };
        Returns: Json;
      };
      get_seating_by_tables: {
        Args: { _slug: string; _table_numbers: number[] };
        Returns: Json;
      };
      submit_rsvp: {
        Args: {
          _slug: string;
          _code: string;
          _attending: boolean;
          _message: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
