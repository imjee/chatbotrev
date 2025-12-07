const RandomChatBot = require('./bot');

try {
  const bot = new RandomChatBot();
  bot.start();
} catch (error) {
  console.error('Failed to start bot:', error.message);
  console.error('Make sure you have set TELEGRAM_BOT_TOKEN in your .env file');
  process.exit(1);
}
