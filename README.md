# ✦ ZodiaKu — Kenali Dirimu, Curhat Sepuasnya

> Aplikasi zodiak interaktif dengan AI curhat, motivasi personal, dan komunitas wall untuk remaja & dewasa muda.

![ZodiaKu Preview](https://img.shields.io/badge/ZodiaKu-Dark%20Cosmic%20Theme-7c5cbf?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Claude AI](https://img.shields.io/badge/Claude_AI-Powered-orange?style=flat)

---

## 🌟 Fitur Utama

### 🔮 Deteksi Zodiak Akurat
- Input nama + tanggal & bulan lahir
- Deteksi 12 zodiak secara akurat berdasarkan tanggal tepat (bukan hanya bulan)
- Tampilkan simbol, elemen, planet penguasa, dan sifat-sifat utama

### 💫 Konten Personal per Zodiak
- **Motivasi**: 5 kata-kata motivasi unik untuk setiap zodiak
- **Karakter**: Analisis mendalam kepribadian berdasarkan zodiak
- **Ramalan**: Prediksi minggu ini yang relevan
- **Hubungan**: Zodiak yang cocok & tips asmara
- **Tebakan Psikis**: Tebakan keadaan si pengguna yang akurat dan relatable

### 🤖 Nova AI — Teman Curhat Cerdas
- Ditenagai Claude AI (Anthropic)
- Mengenal profil zodiak pengguna untuk jawaban lebih personal
- Analisis karakter tulisan untuk menebak kondisi psikis penanya
- Mood tracker terintegrasi
- Quick tips/topik yang bisa langsung diklik
- Mendukung percakapan multi-turn yang kontekstual

### 💬 Community Wall
- Pengunjung bisa meninggalkan komentar & motivasi
- Tersimpan di localStorage browser
- Tampilan grid yang estetis

### 🎨 Desain
- Dark cosmic theme dengan animasi bintang
- Orbit planet animasi di hero section
- Cursor blob effect
- Fully responsive (mobile-friendly)
- Smooth scroll & navigasi aktif
- Toast notifications

---

## 🚀 Cara Menjalankan

### Option 1: Langsung Buka di Browser
```bash
git clone https://github.com/username/zodiak-app.git
cd zodiak-app
# Buka index.html di browser
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### Option 2: Local Server (Recommended)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code: Install "Live Server" extension
```

Buka `http://localhost:8000` di browser.

---

## ⚙️ Setup API Key (untuk Nova AI)

Fitur chat AI membutuhkan koneksi ke Anthropic API.

> **Penting**: Untuk deployment production, **JANGAN** expose API key di frontend. Gunakan backend proxy.

### Development (Testing cepat):
Di `app.js`, API key dihandle oleh claude.ai jika dijalankan sebagai artifact. Untuk standalone, buat proxy sederhana.

### Deployment dengan Backend Proxy:

**Node.js + Express:**
```javascript
// server.js
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));

app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000);
```

Lalu di `app.js`, ubah:
```javascript
const CLAUDE_API = "/api/chat";  // proxy endpoint
```

---

## 📁 Struktur File

```
zodiak-app/
├── index.html      # Struktur HTML utama
├── style.css       # Semua styling (dark cosmic theme)
├── data.js         # Data 12 zodiak + fungsi deteksi
├── app.js          # Logic aplikasi + AI chat
└── README.md       # Dokumentasi ini
```

---

## 🌍 Deploy ke GitHub Pages

1. Push ke repository GitHub
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Akses di `https://username.github.io/zodiak-app`

> Catatan: Untuk fitur Nova AI di GitHub Pages, perlu setup CORS proxy atau Cloudflare Worker sebagai backend.

---

## 🛠️ Tech Stack

| Teknologi | Penggunaan |
|-----------|-----------|
| HTML5 | Struktur halaman |
| CSS3 | Styling, animasi, responsive |
| Vanilla JS | Logic aplikasi |
| Claude API | Nova AI chatbot |
| Google Fonts | Syne + DM Sans |
| Canvas API | Animasi bintang |
| LocalStorage | Data komentar & visitor |

---

## 📊 Data Zodiak

Semua 12 zodiak didukung dengan data lengkap:
- ♈ Aries (21 Mar – 19 Apr)
- ♉ Taurus (20 Apr – 20 Mei)
- ♊ Gemini (21 Mei – 20 Jun)
- ♋ Cancer (21 Jun – 22 Jul)
- ♌ Leo (23 Jul – 22 Agu)
- ♍ Virgo (23 Agu – 22 Sep)
- ♎ Libra (23 Sep – 22 Okt)
- ♏ Scorpio (23 Okt – 21 Nov)
- ♐ Sagitarius (22 Nov – 21 Des)
- ♑ Capricorn (22 Des – 19 Jan)
- ♒ Aquarius (20 Jan – 18 Feb)
- ♓ Pisces (19 Feb – 20 Mar)

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Add: fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

---

## 📝 Lisensi

MIT License — Bebas digunakan dan dimodifikasi.

---

<div align="center">

**Dibuat dengan 💜 untuk kamu yang terus bertumbuh.**

*Zodiak bukan takdir — tapi cermin diri.*

✦ ZodiaKu

</div>
