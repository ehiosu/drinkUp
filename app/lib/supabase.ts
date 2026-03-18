import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type GameSession = {
  id: string;
  game_type: string;
  players: string[];
  created_at: string;
  status: "lobby" | "playing" | "finished";
  current_round: number;
  scores: Record<string, number>;
};
