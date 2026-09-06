import type { Tables } from "@/integrations/supabase/types";

export type Wedding = Tables<"weddings">;

export type Guest = {
  id: string;
  code: string;
  name: string;
  title: string | null;
  seats: number;
  phone: string | null;
  invited_at: string | null;
  created_at: string;
};

export type Rsvp = {
  id: string;
  guest_code: string;
  attending: boolean;
  message: string | null;
  created_at: string;
};

export type SeatingTable = {
  id: string;
  table_number: number;
  table_name: string | null;
  capacity: number;
  map_x: number;
  map_y: number;
  is_active: boolean;
};

export type SeatingAssignment = {
  id: string;
  guest_code: string;
  table_id: string;
};

export type MemberRole = "admin" | "view";

export type WeddingMember = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

// The five bottom-nav destinations. "guests" and "seating" each carry their
// own internal sub-view (Send / Hall plan) rather than being nav items of
// their own — see GuestsSection / SeatingSection.
export type AdminSection = "home" | "guests" | "seating" | "design" | "more";
