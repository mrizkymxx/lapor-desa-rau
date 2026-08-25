"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Clock, Image as ImageIcon, ExternalLink, X, ZoomIn } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { LaporanRow } from "@/lib/supabase";

export default function LacakDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [laporan, setLaporan] = useState<LaporanRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      // Ambil detail spesifik berdasarkan id / kode tiket
      const res = await fetch(`/api/laporan?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setLaporan(json.data);
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
        <div className="w-8 h-8 border-[3px] border-[#121212] border-t-transparent rounded-full animate-spin" />
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
      {/* Lightbox Modal Pratinjau Foto Penuh */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setModalImage(null)}
        >
          <div
            className="nb-box bg-white rounded-2xl w-full max-w-lg p-3 space-y-2 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
              <span className="text-xs font-black uppercase text-[#121212] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-700 stroke-[3px]" />
                {modalImage.title}
              </span>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="nb-btn bg-[#ff99c8] text-[#121212] p-1 rounded-lg hover:bg-rose-300 active:scale-90"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            <div className="rounded-xl border-2 border-[#121212] overflow-hidden bg-slate-900 flex items-center justify-center max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <a
                href={modalImage.url}
                target="_blank"
                rel="noreferrer"
                className="nb-btn bg-[#ffe600] text-[#121212] text-[10px] font-black uppercase px-2.5 py-1 rounded flex items-center gap-1"
              >
                Buka Tab Baru <ExternalLink className="w-3 h-3 stroke-[2.5px]" />
              </a>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="nb-btn bg-[#f6f5f0] text-[#121212] text-[10px] font-black uppercase px-3 py-1 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="nb-btn bg-[#ffe600] text-[#121212] p-1 rounded-lg active:scale-90"
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

        {/* Peta Lokasi Titik Koordinat */}
        {laporan.lat && laporan.lng && (
          <div className="nb-box rounded-2xl p-4 space-y-2.5 bg-white">
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-1.5">
              <span className="text-xs font-black uppercase text-[#121212] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 stroke-[3px] text-emerald-600" />
                TITIK KOORDINAT DI PETA DESA
              </span>
              <a
                href={`https://maps.google.com/?q=${laporan.lat},${laporan.lng}`}
                target="_blank"
                rel="noreferrer"
                className="nb-btn bg-[#ffe600] text-[#121212] px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1"
              >
                Google Maps <ExternalLink className="w-2.5 h-2.5 stroke-[3px]" />
              </a>
            </div>

            {/* Clean OpenStreetMap Card (h-64 / 256px) */}
            <div className="rounded-xl border-[2.5px] border-[#121212] overflow-hidden h-64 shadow-[3px_3px_0px_#121212] relative bg-[#e5e3df]">
              <iframe
                title="Peta Titik Laporan"
                className="w-full h-[calc(100%+45px)] -mt-1 border-0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${laporan.lng - 0.0035}%2C${laporan.lat - 0.0035}%2C${laporan.lng + 0.0035}%2C${laporan.lat + 0.0035}&layer=mapnik&marker=${laporan.lat}%2C${laporan.lng}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#666] pt-0.5">
              <span>LAT: {laporan.lat.toFixed(6)}</span>
              <span>LNG: {laporan.lng.toFixed(6)}</span>
            </div>
          </div>
        )}

        {/* 1. Foto Bukti Awal dari Warga (Dahulukan Sebelum Tanggapan) */}
        <div className="nb-box rounded-2xl p-4 space-y-3 bg-white">
          <span className="text-xs font-black uppercase text-[#121212] block border-b-2 border-[#121212] pb-1">
            KETERANGAN & FOTO KONDISI AWAL
          </span>

          <p className="text-xs font-semibold text-[#333] whitespace-pre-wrap leading-relaxed">
            {laporan.deskripsi}
          </p>

          {laporan.foto_url ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#555] uppercase block">
                  Foto Dikirim Oleh Pelapor:
                </span>
                <span className="text-[9px] font-mono font-bold bg-[#ffe600] border border-[#121212] text-[#121212] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <ZoomIn className="w-2.5 h-2.5" /> KLIK FOTO
                </span>
              </div>
              <div
                onClick={() => setModalImage({ url: laporan.foto_url!, title: "Foto Bukti Laporan Warga" })}
                className="rounded-xl border-[2.5px] border-[#121212] overflow-hidden shadow-[3px_3px_0px_#121212] bg-white cursor-pointer group relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={laporan.foto_url}
                  alt="Bukti Lampiran Warga"
                  className="w-full h-auto max-h-80 object-cover group-hover:scale-[1.02] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1.5">
                  <ZoomIn className="w-4 h-4" /> Klik untuk perbesar
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-[#888] italic pt-1">
              (Pelapor tidak menyertakan foto lampiran)
            </p>
          )}
        </div>

        {/* 2. Tanggapan & Hasil Pengerjaan Petugas Balai Desa */}
        {laporan.tanggapan_petugas && (
          <div className="nb-box bg-[#a7f3d0] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-1.5">
              <span className="font-black text-xs uppercase text-[#121212]">
                🏛️ TANGGAPAN PETUGAS DESA
              </span>
              <span className="font-mono text-[10px] font-bold bg-[#121212] text-white px-1.5 py-0.2 rounded">
                RESMI
              </span>
            </div>

            <p className="text-xs font-semibold text-[#121212] leading-relaxed">
              {laporan.tanggapan_petugas}
            </p>

            {/* Foto Bukti Perbaikan dari Petugas */}
            {laporan.foto_selesai_url && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#121212] flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Foto Bukti Pengerjaan Lapangan:
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-[#121212] text-[#ffe600] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <ZoomIn className="w-2.5 h-2.5" /> KLIK FOTO
                  </span>
                </div>
                <div
                  onClick={() => setModalImage({ url: laporan.foto_selesai_url!, title: "Foto Bukti Pengerjaan Lapangan (Petugas)" })}
                  className="rounded-xl border-[2.5px] border-[#121212] overflow-hidden shadow-[2.5px_2.5px_0px_#121212] bg-white cursor-pointer group relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={laporan.foto_selesai_url}
                    alt="Bukti Selesai Petugas"
                    className="w-full h-auto max-h-72 object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1.5">
                    <ZoomIn className="w-4 h-4" /> Klik untuk perbesar
                  </div>
                </div>
              </div>
            )}

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
      </main>
    </div>
  );
}
