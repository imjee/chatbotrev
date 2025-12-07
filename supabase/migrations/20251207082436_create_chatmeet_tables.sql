/*
  # Create Chat Meet Tables

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key) - Unique identifier for each chat room
      - `name` (text) - Name of the chat room
      - `description` (text) - Description of the chat room
      - `creator_telegram_id` (text) - Telegram ID of the room creator
      - `is_active` (boolean) - Whether the room is currently active
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update
    
    - `chat_members`
      - `id` (uuid, primary key) - Unique identifier
      - `room_id` (uuid) - Reference to chat_rooms
      - `telegram_id` (text) - Telegram user ID
      - `username` (text) - Telegram username
      - `joined_at` (timestamptz) - When the user joined
    
    - `chat_messages`
      - `id` (uuid, primary key) - Unique identifier
      - `room_id` (uuid) - Reference to chat_rooms
      - `telegram_id` (text) - Sender's Telegram ID
      - `username` (text) - Sender's username
      - `message` (text) - The message content
      - `sent_at` (timestamptz) - When the message was sent

  2. Security
    - Enable RLS on all tables
    - Add policies for service role access (bot operations)
    
  3. Important Notes
    - Tables are designed for Telegram bot operations
    - Bot will use service role key for full access
    - Data is organized by chat rooms with members and messages
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  creator_telegram_id text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_members table
CREATE TABLE IF NOT EXISTS chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  telegram_id text NOT NULL,
  username text DEFAULT '',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, telegram_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  telegram_id text NOT NULL,
  username text DEFAULT '',
  message text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_creator ON chat_rooms(creator_telegram_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_telegram ON chat_members(telegram_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (bot will use service role key)
CREATE POLICY "Service role has full access to chat_rooms"
  ON chat_rooms FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to chat_members"
  ON chat_members FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to chat_messages"
  ON chat_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);