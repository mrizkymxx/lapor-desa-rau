-- ============================================================================
-- SKEMA DATABASE: LAPOR DESA RAU (KEC. KEDUNG, KAB. JEPARA)
-- ============================================================================

-- 1. Ekstensi Geospasial PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Master Kategori Aspirasi
CREATE TABLE IF NOT EXISTS public.kategori (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  ikon VARCHAR(30) NOT NULL,
  urutan INT DEFAULT 0
);

INSERT INTO public.kategori (id, nama, slug, ikon, urutan) VALUES
(1, 'Jalan & Jembatan', 'jalan', '🛣️', 1),
(2, 'Kebersihan & Sampah', 'sampah', '🗑️', 2),
(3, 'Penerangan Jalan', 'lampu', '💡', 3),
(4, 'Layanan Administrasi', 'administrasi', '📄', 4),
(5, 'Keamanan & Ketertiban', 'keamanan', '🛡️', 5),
(6, 'Usul & Saran', 'saran', '💬', 6)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  slug = EXCLUDED.slug,
  ikon = EXCLUDED.ikon,
  urutan = EXCLUDED.urutan;

-- 3. Tabel Laporan Aspirasi
CREATE TABLE IF NOT EXISTS public.laporan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_tiket VARCHAR(20) UNIQUE NOT NULL,
  kategori_id INT REFERENCES public.kategori(id) ON DELETE SET NULL,
  judul VARCHAR(150) NOT NULL,
  deskripsi TEXT NOT NULL,
  foto_url TEXT,
  rt VARCHAR(3) NOT NULL,
  rw VARCHAR(3) NOT NULL,
  nama_pelapor VARCHAR(100) DEFAULT 'Warga Rau',
  no_wa VARCHAR(20),
  is_anonim BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  lokasi GEOGRAPHY(POINT, 4326),
  status VARCHAR(20) DEFAULT 'masuk' CHECK (status IN ('masuk', 'diproses', 'selesai', 'ditolak')),
  tanggapan_petugas TEXT,
  foto_selesai_url TEXT,
  petugas_nama VARCHAR(100),
  tgl_ditanggapi TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indeks Kueri Cepat
CREATE INDEX IF NOT EXISTS idx_laporan_status ON public.laporan(status);
CREATE INDEX IF NOT EXISTS idx_laporan_created ON public.laporan(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_lokasi ON public.laporan USING GIST(lokasi);
CREATE INDEX IF NOT EXISTS idx_laporan_kode ON public.laporan(kode_tiket);

-- 5. Trigger Geofencing & Kode Tiket
CREATE OR REPLACE FUNCTION public.fn_proses_laporan_baru()
RETURNS TRIGGER AS $$
DECLARE
  pusat_desa GEOGRAPHY := ST_SetSRID(ST_MakePoint(110.6650, -6.6715), 4326);
  titik_aduan GEOGRAPHY;
  jarak_meter FLOAT;
  tgl_str VARCHAR(8);
  random_hex VARCHAR(4);
BEGIN
  -- Validasi & simpan koordinat
  titik_aduan := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  NEW.lokasi := titik_aduan;
  jarak_meter := ST_Distance(pusat_desa, titik_aduan);

  -- Batas toleransi radius 2000 meter (2.0 km) dari Balai Desa Rau
  IF jarak_meter > 2000.0 THEN
    RAISE EXCEPTION 'Koordinat berada di luar Desa Rau (Jarak terdeteksi: % meter dari pusat desa)', ROUND(jarak_meter::numeric, 0);
  END IF;

  -- Buat kode tiket otomatis jika belum ada: RAU-YYYYMMDD-XXXX
  IF NEW.kode_tiket IS NULL OR NEW.kode_tiket = '' THEN
    tgl_str := TO_CHAR(NOW(), 'YYYYMMDD');
    random_hex := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
    NEW.kode_tiket := 'RAU-' || tgl_str || '-' || random_hex;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proses_laporan ON public.laporan;
CREATE TRIGGER trg_proses_laporan
BEFORE INSERT ON public.laporan
FOR EACH ROW
EXECUTE FUNCTION public.fn_proses_laporan_baru();

-- 6. Row Level Security (RLS)
ALTER TABLE public.kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;

-- Kategori: Publik bisa baca
DROP POLICY IF EXISTS "Publik baca kategori" ON public.kategori;
CREATE POLICY "Publik baca kategori" ON public.kategori FOR SELECT USING (true);

-- Laporan: Publik bisa buat laporan dan baca riwayat
DROP POLICY IF EXISTS "Publik kirim laporan" ON public.laporan;
CREATE POLICY "Publik kirim laporan" ON public.laporan FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Publik baca riwayat laporan" ON public.laporan;
CREATE POLICY "Publik baca riwayat laporan" ON public.laporan FOR SELECT USING (true);

-- Admin (authenticated) bisa update/delete laporan
DROP POLICY IF EXISTS "Admin kelola laporan" ON public.laporan;
CREATE POLICY "Admin kelola laporan" ON public.laporan FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Supabase Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('laporan-media', 'laporan-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Siapa saja bisa upload & baca foto laporan
DROP POLICY IF EXISTS "Publik upload foto laporan" ON storage.objects;
CREATE POLICY "Publik upload foto laporan" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'laporan-media');

DROP POLICY IF EXISTS "Publik baca foto laporan" ON storage.objects;
CREATE POLICY "Publik baca foto laporan" ON storage.objects
FOR SELECT USING (bucket_id = 'laporan-media');
