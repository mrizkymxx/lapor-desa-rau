# lapor — Aspirasi & Pengaduan Warga Desa Rau

Webapp aspirasi dan pengaduan masyarakat berbasis validasi geolokasi GPS presisi untuk **Desa Rau, Kecamatan Kedung, Kabupaten Jepara**.

---

## Fitur Utama

1. **Eksklusif Geofence (Radius 2.0 km)**:
   - Validasi koordinat ganda: Client-side (HTML5 Geolocation) dan Server-side (PostgreSQL PostGIS Trigger).
   - Pengiriman otomatis terkunci jika warga terdeteksi di luar perimeter Desa Rau (`-6.6715, 110.6650`).
2. **Mobile-First & Zero-Cost Architecture**:
   - Touch targets optimal ($\ge 48\text{px}$).
   - Kompresi foto otomatis di browser HP (WebP quality 0.7, ukuran rata-rata $\sim 50\text{ KB}$).
3. **Papan Transparansi Publik**:
   - Seluruh warga dapat melihat status tindak lanjut aduan secara terbuka.
4. **Portal Triage Balai Desa (`/admin`)**:
   - Antarmuka khusus perangkat desa untuk verifikasi, ubah status, dan publikasi tanggapan resmi. PIN default: `rau2026`.

---

## Teknologi
- **Frontend**: Next.js 15 (App Router, Turbopack) + Tailwind CSS
- **Database & Storage**: Supabase (PostgreSQL + PostGIS + Storage Bucket `laporan-media`)
- **Hosting**: Vercel (Hobby Tier - Rp 0)

---

## Menjalankan di Lokal

```bash
# 1. Masuk direktori
cd "D:/Lapor Desa Rau"

# 2. Install dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```

Buka `http://localhost:3000` di browser smartphone atau mode inspeksi mobile browser.
