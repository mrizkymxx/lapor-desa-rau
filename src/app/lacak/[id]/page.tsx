"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Clock, Image as ImageIcon, Share2, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { LaporanRow } from "@/lib/supabase";

export default function LacakDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [laporan, setLaporan] = useState<LaporanRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const handleShareWA = () => {
    if (!laporan) return;
    const currentUrl = window.location.href;
    const statusText =
      laporan.status === "selesai"
        ? "Sampun Rampung / Selesai Dikerjakan"
        : laporan.status === "diproses"
        ? "Sedang Dikerjakan Petugas Desa"
        : "Menunggu Giliran Ditinjau";

    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\n` +
      `Kabar Laporan Warga Desa Rau:\n` +
      `*${laporan.judul}*\n\n` +
      `Lokasi: RT ${laporan.rt} / RW ${laporan.rw}\n` +
      `Nomor Laporan: ${laporan.kode_tiket}\n` +
      `Status: *${statusText}*\n\n` +
      `Matur nuwun. Perkembangan laporan saget dipun tingali wonten mriki:\n` +
      `${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Header */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        </div>

        <button
          type="button"
          onClick={handleShareWA}
          className="nb-btn bg-[#a7f3d0] text-[#121212] text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 uppercase"
          title="Bagi ke WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5 stroke-[3px]" />
          Bagi WA
        </button>
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

          {/* Quick Share Copy */}
          <div className="pt-2 border-t border-[#121212]/20 flex gap-2">
            <button
              type="button"
              onClick={handleShareWA}
              className="nb-btn flex-1 py-2 bg-[#25D366] text-[#121212] font-black text-xs rounded-xl uppercase flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[3px]" />
              Sebar ke Grup WA RT
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="nb-btn px-3 py-2 bg-[#f6f5f0] text-[#121212] font-black text-xs rounded-xl uppercase shrink-0"
            >
              {copied ? "Disalin ✓" : "Salin Link"}
            </button>
          </div>
        </div>

        {/* Peta Lokasi Titik Koordinat (Clean OpenStreetMap Pin Viewport) */}
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

            {/* Clean Crop Container: Card Peta Lebih Besar & Luas (h-64 / 256px) */}
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

        {/* Tanggapan Balai Desa */}
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
                <span className="text-[10px] font-black uppercase text-[#121212] flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Foto Bukti Pengerjaan Lapangan:
                </span>
                <div className="rounded-xl border-[2.5px] border-[#121212] overflow-hidden shadow-[2.5px_2.5px_0px_#121212] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={laporan.foto_selesai_url}
                    alt="Bukti Selesai Petugas"
                    className="w-full h-auto max-h-72 object-cover"
                  />
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

        {/* Foto Bukti Awal dari Warga */}
        <div className="nb-box rounded-2xl p-4 space-y-3 bg-white">
          <span className="text-xs font-black uppercase text-[#121212] block border-b-2 border-[#121212] pb-1">
            KETERANGAN & FOTO KONDISI AWAL
          </span>

          <p className="text-xs font-semibold text-[#333] whitespace-pre-wrap leading-relaxed">
            {laporan.deskripsi}
          </p>

          {laporan.foto_url ? (
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#555] uppercase block">
                Foto Dikirim Oleh Pelapor:
              </span>
              <div className="rounded-xl border-[2.5px] border-[#121212] overflow-hidden shadow-[3px_3px_0px_#121212] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={laporan.foto_url}
                  alt="Bukti Lampiran Warga"
                  className="w-full h-auto max-h-80 object-cover"
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-[#888] italic pt-1">
              (Pelapor tidak menyertakan foto lampiran)
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
