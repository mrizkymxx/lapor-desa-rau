import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jmodbcloxdcbybavudfp.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptb2RiY2xveGRjYnliYXZ1ZGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk4MjYsImV4cCI6MjEwMzA3NTgyNn0.zIdyg1JfMAgDXcnDorwCsz51SXZwE6rBfMrrptycAKo";

// Client-side Supabase instance (RLS protected)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LaporanRow {
  id: string;
  kode_tiket: string;
  kategori_id: number;
  judul: string;
  deskripsi: string;
  foto_url?: string | null;
  rt: string;
  rw: string;
  nama_pelapor: string;
  no_wa?: string | null;
  is_anonim: boolean;
  lat: number;
  lng: number;
  status: "masuk" | "diproses" | "selesai" | "ditolak";
  tanggapan_petugas?: string | null;
  foto_selesai_url?: string | null;
  petugas_nama?: string | null;
  tgl_ditanggapi?: string | null;
  created_at: string;
  updated_at: string;
  kategori?: {
    id: number;
    nama: string;
    slug: string;
    ikon: string;
  };
}

export interface KategoriRow {
  id: number;
  nama: string;
  slug: string;
  ikon: string;
  urutan: number;
}
