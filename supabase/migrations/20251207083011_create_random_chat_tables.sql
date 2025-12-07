/*
  # Create Random Chat Tables

  1. Drop Old Tables
    - Remove old chat_rooms, chat_members, chat_messages tables
  
  2. New Tables
    - `users`
      - `telegram_id` (text, primary key) - Telegram user ID
      - `username` (text) - Telegram username
      - `first_name` (text) - User's first name
      - `is_searching` (boolean) - Whether user is looking for partner
      - `partner_id` (text) - Current chat partner's telegram_id
      - `created_at` (timestamptz) - When user first used bot
      - `updated_at` (timestamptz) - Last activity
    
    - `chat_sessions`
      - `id` (uuid, primary key) - Unique session ID
      - `user1_id` (text) - First user's telegram_id
      - `user2_id` (text) - Second user's telegram_id
      - `started_at` (timestamptz) - When chat started
      - `ended_at` (timestamptz) - When chat ended
      - `ended_by` (text) - Who ended the chat
    
    - `messages`
      - `id` (uuid, primary key) - Unique message ID
      - `session_id` (uuid) - Reference to chat_sessions
      - `sender_id` (text) - Sender's telegram_id
      - `message_text` (text) - Message content
      - `sent_at` (timestamptz) - When message was sent

  3. Security
    - Enable RLS on all tables
    - Add policies for service role access (bot operations)
    
  4. Important Notes
    - Bot uses service role for full database access
    - Users are matched randomly when searching
    - All conversations are private and relayed through bot
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  telegram_id text PRIMARY KEY,
  username text DEFAULT '',
  first_name text DEFAULT '',
  is_searching boolean DEFAULT false,
  partner_id text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id text NOT NULL,
  user2_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz DEFAULT NULL,
  ended_by text DEFAULT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  message_text text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_searching ON users(is_searching) WHERE is_searching = true;
CREATE INDEX IF NOT EXISTS idx_users_partner ON users(partner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_users ON chat_sessions(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ended ON chat_sessions(ended_at);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (bot will use service role key)
CREATE POLICY "Service role has full access to users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to chat_sessions"
  ON chat_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to messages"
  ON messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);