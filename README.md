# Sistem Solar Tracker — Dashboard

Ringkasan singkat
- Aplikasi dashboard berbasis React + Vite untuk memantau sistem solar tracker.
- Menampilkan data utama (tegangan, arus, daya, suhu) yang diambil berkala dari Firebase Realtime Database.
- Menyertakan panel pembanding (`nonsistem.json`) dan kontrol untuk mengirim perintah `BUTTON`.

Fitur utama
- Polling GET ke endpoint Data.json setiap 5 detik untuk update real-time.
- Tombol kontrol yang melakukan PATCH (optimistic update) untuk field `BUTTON`.
- Styling desktop-first, dengan optimasi UI mobile (floating action button).
- Background SVG tersentral sebagai latar, dan card transparan agar motif background terlihat.

Struktur penting
- `src/App.jsx` — Komponen utama dashboard.
- `src/App.css` — Semua gaya aplikasi (grid, kartu, responsif).
- `src/utils/solarTrackerApi.js` — Helper API: `fetchSolarTrackerData()`, `fetchNonSistemData()`, `sendButtonCommand()`.
- `src/assets/` — `background.svg`, `gedung.webp`, `4.UMS.png` (logo), dll.

Endpoint API (Firebase)
- GET Data utama:
	```
	GET https://sistem-solar-tracker-default-rtdb.firebaseio.com/Data.json
	```
	Response contoh: `{"ARUS":5,"DAYA":60,"TEGANGAN":20,"SUHU":...,"BUTTON":"ON"}`

- GET pembanding (nonsistem):
	```
	GET https://sistem-solar-tracker-default-rtdb.firebaseio.com/nonsistem.json
	```
	Response contoh: `{"ARUS":5,"DAYA":60,"TEGANGAN":20}`

- PATCH untuk tombol (mengubah field `BUTTON`):
	```
	PATCH https://sistem-solar-tracker-default-rtdb.firebaseio.com/Data.json
	Content-Type: application/json
	Body: { "BUTTON": "ON" }
	```

Menjalankan secara lokal
1. Install dependencies:
```bash
cd react
npm install
```
2. Jalankan dev server (lihat port di terminal):
```bash
npm run dev
# untuk meng-expose ke jaringan: npm run dev -- --host
```
3. Build produksi:
```bash
npm run build
# output ke folder `dist/`
```

Catatan operasi
- Polling interval ada di `src/App.jsx` (default 5000 ms). Ubah bila butuh.
- Jika Firebase butuh authentication atau path berbeda, ubah URL di `src/utils/solarTrackerApi.js`.

Deploy ke Vercel
1. Login ke Vercel dan import project dari GitHub (atau pilih "Import Project" dan arahkan ke repo lokal).
2. Set build command dan output directory:
	 - Build Command: `npm run build`
	 - Output Directory: `dist`
3. (Opsional) Tambahkan environment variables jika URL API diganti atau membutuhkan key.
4. Deploy — Vercel akan menjalankan build dan menyajikan situs statis.

Contoh curl
```bash
# Ambil data utama
curl -X GET https://sistem-solar-tracker-default-rtdb.firebaseio.com/Data.json

# Ambil data pembanding
curl -X GET https://sistem-solar-tracker-default-rtdb.firebaseio.com/nonsistem.json

# Kirim perintah tombol
curl -X PATCH -d '{"BUTTON":"ON"}' -H "Content-Type: application/json" https://sistem-solar-tracker-default-rtdb.firebaseio.com/Data.json
```

Butuh bantuan deploy Vercel atau menambah environment variables (secrets)? Sampaikan, saya bantu langkah selanjutnya.
