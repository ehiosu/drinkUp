-- DrinkUp Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL,
  players TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
  current_round INTEGER NOT NULL DEFAULT 1,
  scores JSONB NOT NULL DEFAULT '{}',
  room_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom questions table (user-submitted)
CREATE TABLE IF NOT EXISTS custom_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL,
  content TEXT NOT NULL,
  option_a TEXT, -- for would-you-rather
  option_b TEXT, -- for would-you-rather
  submitted_by TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game history / leaderboard
CREATE TABLE IF NOT EXISTS game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id),
  game_type TEXT NOT NULL,
  players TEXT[] NOT NULL,
  winner TEXT,
  rounds_played INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON game_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_custom_questions_type ON custom_questions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_history_type ON game_history(game_type);

-- Enable realtime for game sessions (for multiplayer)
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write sessions (party game, no auth needed)
CREATE POLICY "Anyone can read sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON game_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can read approved questions" ON custom_questions FOR SELECT USING (approved = true);
CREATE POLICY "Anyone can submit questions" ON custom_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read history" ON game_history FOR SELECT USING (true);
CREATE POLICY "Anyone can write history" ON game_history FOR INSERT WITH CHECK (true);
