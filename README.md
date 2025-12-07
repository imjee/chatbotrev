# Random Chat Bot - Telegram

Bot Telegram untuk bertemu dan ngobrol dengan orang asing secara acak, seperti Omegle tapi di Telegram!

## Fitur

- Koneksi random dengan orang asing
- Chat anonim (dipanggil "Stranger")
- Skip partner kapan saja dengan /next
- Mendukung berbagai jenis media (foto, video, sticker, voice, dll)
- Riwayat chat tersimpan di database
- Statistik pengguna dan chat aktif
- Sistem matching otomatis

## Cara Setup

### 1. Dapatkan Token Bot Telegram

1. Buka Telegram dan cari [@BotFather](https://t.me/BotFather)
2. Kirim perintah `/newbot`
3. Ikuti instruksi untuk memberi nama bot Anda
4. BotFather akan memberikan token bot (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Simpan token ini dengan aman

### 2. Setup Environment Variables

Edit file `.env` dan ganti `YOUR_TELEGRAM_BOT_TOKEN_HERE` dengan token yang Anda dapatkan dari BotFather:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. Jalankan Bot

```bash
npm start
```

Atau:

```bash
node index.js
```

Bot akan mulai berjalan dan siap menerima perintah!

## Cara Menggunakan Bot

### Perintah Dasar

**1. Mulai Bot**
```
/start
```
Menampilkan pesan selamat datang dan instruksi

**2. Bantuan**
```
/help
```
Menampilkan panduan lengkap cara menggunakan bot

**3. Cari Teman Ngobrol**
```
/search
```
Mencari partner random untuk ngobrol. Bot akan:
- Langsung menghubungkan jika ada orang yang sedang menunggu
- Atau memasukkan Anda ke antrian pencarian

**4. Hentikan Chat**
```
/stop
```
Menghentikan chat dengan partner saat ini dan keluar dari percakapan

**5. Skip Partner**
```
/next
```
Skip partner saat ini dan langsung cari partner baru

**6. Statistik**
```
/stats
```
Melihat statistik bot (total pengguna, chat aktif, total chat)

### Cara Ngobrol

1. Ketik `/search` untuk mulai mencari partner
2. Tunggu sampai terhubung dengan orang asing
3. Kirim pesan apapun - pesan akan diteruskan ke partner
4. Partner akan menerima pesan dengan label "Stranger:"
5. Gunakan `/next` untuk skip atau `/stop` untuk keluar

### Jenis Pesan yang Didukung

- Teks biasa
- Foto
- Video
- Sticker
- Voice message
- Dokumen

## Cara Kerja

1. **User Mencari**: User ketik `/search`
2. **Matching**: Bot cari user lain yang juga sedang `/search`
3. **Connect**: Kedua user terhubung otomatis
4. **Chat**: Pesan langsung diteruskan ke partner
5. **Skip/Stop**: User bisa skip atau stop kapan saja

## Database

Bot menggunakan Supabase dengan 3 tabel:

- **users**: Data pengguna dan status mereka
- **chat_sessions**: Riwayat sesi chat
- **messages**: Semua pesan yang dikirim

## Aturan Penggunaan

- Bersikap sopan dan hormat
- Jangan spam atau flood
- Jangan kirim konten tidak pantas
- Jangan share informasi pribadi sensitif

## Teknologi

- Node.js
- node-telegram-bot-api
- Supabase (PostgreSQL)
- dotenv

## Troubleshooting

**Bot tidak merespons?**
- Pastikan token bot sudah benar di file `.env`
- Pastikan bot sudah running dengan `npm start`
- Cek koneksi internet

**Tidak bisa terhubung dengan partner?**
- Tunggu user lain yang juga sedang mencari
- Coba lagi dengan `/search`
- Bot hanya bisa menghubungkan jika ada 2 orang mencari

**Pesan tidak terkirim?**
- Partner mungkin sudah keluar
- Gunakan `/stop` dan cari partner baru dengan `/search`

## Privacy & Security

- Chat bersifat anonim (hanya muncul sebagai "Stranger")
- Username dan nama asli tidak ditampilkan ke partner
- Riwayat chat tersimpan untuk moderasi
- Jangan share informasi pribadi sensitif

## Lisensi

MIT
