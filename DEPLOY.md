# Panduan Deploy Random Chat Bot

Bot sudah siap deploy! Pilih salah satu platform di bawah ini:

## Opsi 1: Railway (Recommended - Paling Mudah)

### Langkah-langkah:

1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO-NAME.git
   git push -u origin main
   ```

2. **Deploy ke Railway:**
   - Buka https://railway.app
   - Klik "Start a New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih repository kamu
   - Railway akan auto-detect dan deploy

3. **Tambahkan Environment Variables di Railway:**
   - Buka project settings
   - Masuk ke tab "Variables"
   - Tambahkan:
     - `TELEGRAM_BOT_TOKEN` = [token bot kamu]
     - `VITE_SUPABASE_URL` = [supabase url]
     - `VITE_SUPABASE_ANON_KEY` = [supabase anon key]

4. **Deploy ulang** - Railway akan restart otomatis

Bot akan online 24/7!

---

## Opsi 2: Render

### Langkah-langkah:

1. **Push ke GitHub** (sama seperti Railway)

2. **Deploy ke Render:**
   - Buka https://render.com
   - Klik "New +" → "Web Service"
   - Connect GitHub repository
   - Render akan detect `render.yaml` otomatis

3. **Tambahkan Environment Variables:**
   - Di dashboard Render
   - Masuk ke "Environment"
   - Tambahkan variabel yang sama seperti Railway

4. **Deploy** - Render akan build dan run

---

## Opsi 3: VPS (DigitalOcean, Vultr, Contabo)

### Langkah-langkah:

1. **SSH ke VPS:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone project:**
   ```bash
   git clone https://github.com/USERNAME/REPO-NAME.git
   cd REPO-NAME
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Setup environment variables:**
   ```bash
   nano .env
   # Copy paste semua variabel dari .env lokal
   # Save: Ctrl+X, Y, Enter
   ```

6. **Install PM2 untuk keep bot running:**
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name random-chat-bot
   pm2 startup
   pm2 save
   ```

Bot akan tetap running bahkan setelah restart server!

---

## Opsi 4: Replit

1. Import project ke Replit
2. Tambahkan Secrets (environment variables) di panel Secrets
3. Click "Run"

**Catatan:** Free tier Replit akan sleep setelah inactive, perlu upgrade untuk 24/7.

---

## Verifikasi Bot Running

Setelah deploy, cek di Telegram:
1. Cari bot kamu: @YOUR_BOT_USERNAME
2. Kirim /start
3. Jika bot reply, berarti berhasil!

## Monitoring

- **Railway/Render:** Cek logs di dashboard mereka
- **VPS:** Gunakan `pm2 logs random-chat-bot`

## Troubleshooting

Jika bot tidak respond:
1. Cek logs untuk error
2. Pastikan environment variables sudah benar
3. Pastikan Supabase database accessible
4. Test bot token dengan: https://api.telegram.org/bot<TOKEN>/getMe
