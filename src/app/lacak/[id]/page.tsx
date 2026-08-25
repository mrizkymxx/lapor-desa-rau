"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Building2, Loader2, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { LaporanRow } from "@/lib/supabase";

export default function LacakDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [laporan, setLaporan] = useState<LaporanRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/laporan`);
      const json = await res.json();
      if (res.ok && json.data) {
        const found = json.data.find((item: LaporanRow) => item.id === id || item.kode_tiket === id);
        setLaporan(found || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#121212] gap-2 bg-[#f6f5f0]">
        <Loader2 className="w-6 h-6 animate-spin stroke-[3px]" />
        <span className="text-xs font-mono font-bold uppercase">Mencari detail tiket...</span>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#f6f5f0]">
        <div className="w-14 h-14 bg-[#ff99c8] border-[3px] border-[#121212] rounded-2xl flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_#121212]">
          ✕
        </div>
        <h2 className="text-base font-black uppercase text-[#121212]">Laporan Tidak Ditemukan</h2>
        <p className="text-xs font-bold text-[#666]">Periksa kembali nomor tiket yang kamu masukkan.</p>
        <Link
          href="/riwayat"
          className="nb-btn py-2.5 px-4 bg-[#ffe600] text-[#121212] rounded-xl text-xs font-black uppercase"
        >
          Kembali ke Papan ➔
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-16 bg-[#f6f5f0]">
      {/* Header */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="nb-btn bg-[#ffe600] text-[#121212] p-1.5 rounded-lg active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3px]" />
        </button>
        <div>
          <h1 className="text-base font-black uppercase leading-tight">STATUS LAPORAN</h1>
          <span className="font-mono text-xs font-bold text-[#ffe600]">{laporan.kode_tiket}</span>
        </div>
      </header>

      <main className="p-4 space-y-4 flex-1">
        {/* Ringkasan */}
        <div className="nb-box rounded-2xl p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
            <span className="text-[11px] font-black uppercase text-[#666]">STATUS SAAT INI</span>
            <StatusBadge status={laporan.status} />
          </div>

          <h2 className="text-base font-black text-[#121212] leading-snug">{laporan.judul}</h2>

          <div className="flex flex-wrap gap-2 text-xs font-bold text-[#121212] pt-1">
            <span className="bg-[#e4c1f9] border-2 border-[#121212] px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#121212] flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 stroke-[2.5px]" />
              RT {laporan.rt} / RW {laporan.rw}, Desa Rau
            </span>
            <span className="bg-[#ffd166] border-2 border-[#121212] px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#121212] flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5px]" />
              {new Date(laporan.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Tanggapan Balai Desa */}
        {laporan.tanggapan_petugas && (
          <div className="nb-box bg-[#a7f3d0] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase text-[#121212] border-b-2 border-[#121212] pb-1">
              <span>🏛️ TANGGAPAN BALAI DESA</span>
            </div>
            <p className="text-xs font-semibold text-[#121212] leading-relaxed">
              {laporan.tanggapan_petugas}
            </p>
            <div className="pt-2 border-t-2 border-[#121212] flex items-center justify-between text-[11px] font-bold">
              <span>Petugas: {laporan.petugas_nama || "Perangkat Desa"}</span>
              {laporan.tgl_ditanggapi && (
                <span className="font-mono">
                  {new Date(laporan.tgl_ditanggapi).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Detail Aduan Lengkap */}
        <div className="nb-box rounded-2xl p-4 space-y-3 bg-white">
          <span className="text-xs font-black uppercase text-[#121212] block border-b-2 border-[#121212] pb-1">
            KETERANGAN LENGKAP
          </span>

          <p className="text-xs font-semibold text-[#333] whitespace-pre-wrap leading-relaxed">
            {laporan.deskripsi}
          </p>

          {laporan.foto_url && (
            <div className="rounded-xl border-[2.5px] border-[#121212] overflow-hidden shadow-[3px_3px_0px_#121212] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={laporan.foto_url}
                alt="Bukti Lampiran"
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
