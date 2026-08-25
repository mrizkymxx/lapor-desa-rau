"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Camera,
  MessageSquare,
  Building,
  Sparkles,
  ChevronRight,
  Flame,
  Users,
  Search,
  Share2,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { LaporanRow } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [recentReports, setRecentReports] = useState<LaporanRow[]>([]);
  const [stats, setStats] = useState({ total: 0, selesai: 0 });
  const [searchTicket, setSearchTicket] = useState("");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/laporan");
      const json = await res.json();
      if (res.ok && json.data) {
        setRecentReports(json.data.slice(0, 3));
        const total = json.data.length;
        const selesai = json.data.filter((l: LaporanRow) => l.status === "selesai").length;
        setStats({ total, selesai });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLacakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicket.trim()) return;
    router.push(`/lacak/${searchTicket.trim()}`);
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-[#f6f5f0]">
      {/* Header Sticky */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📢</span>
          <div>
            <h1 className="text-base font-black tracking-tight uppercase leading-none">
              LAPOR.RAU
            </h1>
            <p className="text-[10px] text-[#ffe600] font-mono font-bold">DESA RAU • JEPARA</p>
          </div>
        </div>

        <Link
          href="/lapor"
          className="nb-btn bg-[#ffe600] text-[#121212] text-xs font-black px-3 py-1.5 rounded uppercase flex items-center gap-1"
        >
          Buat Aduan ➔
        </Link>
      </header>

      <main className="p-4 space-y-4 flex-1">
        {/* Hero Banner Neo-Brutalism */}
        <section className="nb-box bg-[#ffe600] rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="inline-block bg-[#121212] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-[2px_2px_0px_#fff]">
            ★ SUARA WARGA DESA RAU
          </div>

          <h2 className="text-2xl font-black uppercase text-[#121212] leading-[1.1]">
            JALAN RUSAK? LAMPU MATI? LAPORKAN LANGSUNG!
          </h2>

          <p className="text-xs font-bold text-[#121212]/90 leading-relaxed">
            Kanal aspirasi digital resmi warga Desa Rau, Kec. Kedung, Jepara. Foto, kirim dengan GPS, dan pantau pengerjaannya oleh balai desa sampai beres.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/lapor"
              className="nb-btn w-full py-3.5 bg-[#121212] text-[#ffe600] rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 text-center"
            >
              <Zap className="w-4 h-4 fill-[#ffe600]" />
              KIRIM ADUAN SEKARANG
            </Link>
            <Link
              href="/riwayat"
              className="nb-btn w-full py-2.5 bg-white text-[#121212] rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 text-center"
            >
              Lihat Papan Aspirasi Warga ➔
            </Link>
          </div>
        </section>

        {/* Kotak Lacak Tiket Cepat */}
        <section className="nb-box bg-white rounded-2xl p-3.5 space-y-2">
          <span className="text-[11px] font-black uppercase text-[#121212] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 stroke-[3px]" />
            SUDAH PERNAH LAPOR? LACAK DI SINI:
          </span>
          <form onSubmit={handleLacakSubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Contoh: RAU-20260825-XXXX"
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              className="nb-input flex-1 h-10 px-3 rounded-lg text-xs font-mono font-bold bg-[#f6f5f0] placeholder:text-[#888]"
            />
            <button
              type="submit"
              className="nb-btn bg-[#121212] text-[#ffe600] px-3 h-10 rounded-lg text-xs font-black uppercase shrink-0"
            >
              Lacak ➔
            </button>
          </form>
        </section>

        {/* Counter Stats Bento */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="nb-box bg-[#a7f3d0] rounded-2xl p-3.5">
            <span className="text-[10px] font-black uppercase text-[#121212] block">
              ADUAN TUNTAS
            </span>
            <div className="text-3xl font-black font-mono text-[#121212] mt-0.5">
              {stats.selesai}
            </div>
            <span className="text-[10px] font-bold text-[#121212]/70">Telah ditindaklanjuti</span>
          </div>

          <div className="nb-box bg-[#70d6ff] rounded-2xl p-3.5">
            <span className="text-[10px] font-black uppercase text-[#121212] block">
              TOTAL MASUK
            </span>
            <div className="text-3xl font-black font-mono text-[#121212] mt-0.5">
              {stats.total}
            </div>
            <span className="text-[10px] font-bold text-[#121212]/70">Dari RT 01 s/d RT 08</span>
          </div>
        </section>

        {/* 3 Langkah Mudah */}
        <section className="nb-box bg-white rounded-2xl p-4 space-y-3">
          <div className="border-b-2 border-[#121212] pb-1.5 flex items-center justify-between">
            <span className="text-xs font-black uppercase">CARA KERJA CEPAT</span>
            <span className="text-[10px] font-mono font-bold bg-[#121212] text-[#ffe600] px-1.5 py-0.2 rounded">
              3 LANGKAH
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="nb-box-sm bg-[#f6f5f0] p-2.5 rounded-xl flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#121212] text-[#ffe600] font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h4 className="text-xs font-black uppercase">FOTO & AKTIFKAN GPS</h4>
                <p className="text-[11px] font-semibold text-[#555]">
                  Ambil foto masalah di lokasi. Sistem otomatis memvalidasi koordinat Desa Rau.
                </p>
              </div>
            </div>

            <div className="nb-box-sm bg-[#f6f5f0] p-2.5 rounded-xl flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#121212] text-[#ffe600] font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h4 className="text-xs font-black uppercase">KIRIM KE BALAI DESA</h4>
                <p className="text-[11px] font-semibold text-[#555]">
                  Pilih kategori (jalan, sampah, lampu, bansos) dan simpan kode tiket unik kamu.
                </p>
              </div>
            </div>

            <div className="nb-box-sm bg-[#f6f5f0] p-2.5 rounded-xl flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#121212] text-[#ffe600] font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h4 className="text-xs font-black uppercase">PANTAU SAMPAI TUNTAS</h4>
                <p className="text-[11px] font-semibold text-[#555]">
                  Petugas balai desa turun ke lapangan dan memberikan kabar tindak lanjut terbuka.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Aduan Terbaru */}
        {recentReports.length > 0 && (
          <section className="nb-box bg-white rounded-2xl p-4 space-y-3">
            <div className="border-b-2 border-[#121212] pb-1.5 flex items-center justify-between">
              <span className="text-xs font-black uppercase">ADUAN TERBARU WARGA</span>
              <Link href="/riwayat" className="text-[10px] font-black text-[#121212] underline">
                Lihat Semua ➔
              </Link>
            </div>

            <div className="space-y-2">
              {recentReports.map((item) => (
                <Link
                  key={item.id}
                  href={`/lacak/${item.id}`}
                  className="block nb-box-sm bg-[#f6f5f0] hover:bg-[#ffe600] p-2.5 rounded-xl transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#555]">
                      RT {item.rt} / RW {item.rw}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs font-black text-[#121212] line-clamp-1">{item.judul}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Banner Keamanan Geofence */}
        <section className="nb-box bg-[#e4c1f9] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase">
            <ShieldCheck className="w-4 h-4 stroke-[3px]" />
            <span>KHUSUS & EKSKLUSIF WARGA DESA RAU</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-[#121212]/90">
            Sistem menggunakan verifikasi perimeter radius 2.0 km dari Balai Desa Rau. Warga luar wilayah tidak dapat mengirim laporan palsu.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
