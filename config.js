require('dotenv').config();

module.exports = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
};
