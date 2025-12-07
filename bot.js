const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const db = require('./database');

class RandomChatBot {
  constructor() {
    if (!config.telegramToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    }

    this.bot = new TelegramBot(config.telegramToken, { polling: true });
    this.setupCommands();
    this.setupMessageHandler();
  }

  setupCommands() {
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
    this.bot.onText(/\/search/, (msg) => this.handleSearch(msg));
    this.bot.onText(/\/stop/, (msg) => this.handleStop(msg));
    this.bot.onText(/\/next/, (msg) => this.handleNext(msg));
    this.bot.onText(/\/stats/, (msg) => this.handleStats(msg));
  }

  setupMessageHandler() {
    this.bot.on('message', async (msg) => {
      if (msg.text && msg.text.startsWith('/')) return;

      await this.handleMessage(msg);
    });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const username = msg.from.username || '';
    const firstName = msg.from.first_name || '';

    try {
      await db.getOrCreateUser(userId, username, firstName);

      const welcomeMessage = `
Selamat datang di Random Chat Bot!

Bot ini menghubungkan kamu dengan orang asing secara acak untuk ngobrol.

Perintah:
/search - Cari teman ngobrol random
/stop - Hentikan chat saat ini
/next - Skip partner dan cari yang baru
/stats - Lihat statistik bot
/help - Tampilkan bantuan

Ketik /search untuk mulai!
      `;

      await this.bot.sendMessage(chatId, welcomeMessage);
    } catch (error) {
      console.error('Error in handleStart:', error);
      await this.bot.sendMessage(chatId, 'Terjadi kesalahan. Coba lagi nanti.');
    }
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `
Cara menggunakan Random Chat Bot:

1. Ketik /search untuk mencari teman ngobrol
2. Bot akan mencari partner yang tersedia
3. Setelah terhubung, kirim pesan apapun
4. Pesan kamu akan diteruskan ke partner
5. Gunakan /next untuk skip partner
6. Gunakan /stop untuk keluar dari chat

Aturan:
- Bersikap sopan dan hormat
- Jangan spam
- Jangan kirim konten tidak pantas

Selamat ngobrol!
    `;

    await this.bot.sendMessage(chatId, helpMessage);
  }

  async handleSearch(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const username = msg.from.username || '';
    const firstName = msg.from.first_name || '';

    try {
      await db.getOrCreateUser(userId, username, firstName);

      const currentPartner = await db.getUserPartner(userId);
      if (currentPartner) {
        await this.bot.sendMessage(chatId, 'Kamu sudah dalam chat! Gunakan /stop untuk keluar terlebih dahulu.');
        return;
      }

      const partner = await db.findRandomPartner(userId);

      if (partner) {
        await db.createChatSession(userId, partner.telegram_id);

        await this.bot.sendMessage(chatId, 'Terhubung! Kamu sekarang ngobrol dengan orang asing. Ketik apapun untuk memulai!\n\nGunakan /next untuk skip atau /stop untuk keluar.');
        await this.bot.sendMessage(partner.telegram_id, 'Terhubung! Kamu sekarang ngobrol dengan orang asing. Ketik apapun untuk memulai!\n\nGunakan /next untuk skip atau /stop untuk keluar.');
      } else {
        await db.setUserSearching(userId, true);
        await this.bot.sendMessage(chatId, 'Mencari partner...\n\nMenunggu orang lain yang juga sedang mencari. Gunakan /stop untuk membatalkan.');
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      await this.bot.sendMessage(chatId, 'Terjadi kesalahan saat mencari partner. Coba lagi.');
    }
  }

  async handleStop(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      const partnerId = await db.getUserPartner(userId);

      if (partnerId) {
        await db.endChatSession(userId, partnerId, userId);

        await this.bot.sendMessage(chatId, 'Chat dihentikan. Gunakan /search untuk mencari partner baru.');

        try {
          await this.bot.sendMessage(partnerId, 'Partner telah menghentikan chat. Gunakan /search untuk mencari partner baru.');
        } catch (e) {
          console.log('Could not notify partner');
        }
      } else {
        await db.setUserSearching(userId, false);
        await this.bot.sendMessage(chatId, 'Pencarian dibatalkan. Gunakan /search untuk mencari lagi.');
      }
    } catch (error) {
      console.error('Error in handleStop:', error);
      await this.bot.sendMessage(chatId, 'Terjadi kesalahan. Coba lagi.');
    }
  }

  async handleNext(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      const partnerId = await db.getUserPartner(userId);

      if (!partnerId) {
        await this.bot.sendMessage(chatId, 'Kamu tidak sedang dalam chat. Gunakan /search untuk mencari partner.');
        return;
      }

      await db.endChatSession(userId, partnerId, userId);

      try {
        await this.bot.sendMessage(partnerId, 'Partner telah skip. Gunakan /search untuk mencari partner baru.');
      } catch (e) {
        console.log('Could not notify partner');
      }

      const newPartner = await db.findRandomPartner(userId);

      if (newPartner) {
        await db.createChatSession(userId, newPartner.telegram_id);

        await this.bot.sendMessage(chatId, 'Terhubung dengan partner baru! Ketik apapun untuk memulai.');
        await this.bot.sendMessage(newPartner.telegram_id, 'Terhubung! Kamu sekarang ngobrol dengan orang asing. Ketik apapun untuk memulai!');
      } else {
        await db.setUserSearching(userId, true);
        await this.bot.sendMessage(chatId, 'Mencari partner baru...');
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      await this.bot.sendMessage(chatId, 'Terjadi kesalahan. Coba lagi.');
    }
  }

  async handleStats(msg) {
    const chatId = msg.chat.id;

    try {
      const stats = await db.getStats();

      const statsMessage = `
Statistik Bot:

Total Pengguna: ${stats.totalUsers}
Chat Aktif: ${stats.activeSessions}
Total Chat: ${stats.totalSessions}
      `;

      await this.bot.sendMessage(chatId, statsMessage);
    } catch (error) {
      console.error('Error in handleStats:', error);
      await this.bot.sendMessage(chatId, 'Tidak dapat mengambil statistik.');
    }
  }

  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      const partnerId = await db.getUserPartner(userId);

      if (!partnerId) {
        await this.bot.sendMessage(chatId, 'Kamu tidak sedang dalam chat. Gunakan /search untuk mencari partner.');
        return;
      }

      const session = await db.getCurrentSession(userId);

      if (session) {
        await db.saveMessage(session.id, userId, msg.text);
      }

      try {
        if (msg.text) {
          await this.bot.sendMessage(partnerId, `Stranger: ${msg.text}`);
        } else if (msg.photo) {
          await this.bot.sendPhoto(partnerId, msg.photo[msg.photo.length - 1].file_id, {
            caption: 'Stranger sent a photo'
          });
        } else if (msg.sticker) {
          await this.bot.sendSticker(partnerId, msg.sticker.file_id);
        } else if (msg.voice) {
          await this.bot.sendVoice(partnerId, msg.voice.file_id);
        } else if (msg.video) {
          await this.bot.sendVideo(partnerId, msg.video.file_id);
        } else if (msg.document) {
          await this.bot.sendDocument(partnerId, msg.document.file_id);
        }
      } catch (e) {
        console.error('Could not send message to partner:', e);
        await this.bot.sendMessage(chatId, 'Partner tidak tersedia. Gunakan /stop untuk keluar.');
        await db.endChatSession(userId, partnerId, 'system');
      }
    } catch (error) {
      console.error('Error in handleMessage:', error);
    }
  }

  start() {
    console.log('Random Chat Bot is running...');
  }
}

module.exports = RandomChatBot;
