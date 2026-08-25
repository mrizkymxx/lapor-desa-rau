"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Camera,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RotateCw,
  Send,
  X,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { requestWargaLocation, GeoLocationResult, DESA_RAU } from "@/lib/geo";
import { BottomNav } from "@/components/BottomNav";

const KATEGORI_ITEMS = [
  { id: 1, label: "Jalan Rusak", icon: "🚧", bg: "bg-[#ffe600]" },
  { id: 2, label: "Sampah / Banjir", icon: "🌊", bg: "bg-[#70d6ff]" },
  { id: 3, label: "Lampu Padam", icon: "💡", bg: "bg-[#ff99c8]" },
  { id: 4, label: "Pelayanan Desa", icon: "📑", bg: "bg-[#e4c1f9]" },
  { id: 5, label: "Keamanan / Kamtib", icon: "🚨", bg: "bg-[#ffd166]" },
  { id: 6, label: "Ide & Usulan", icon: "💡", bg: "bg-[#a7f3d0]" },
];

export default function LaporPage() {
  const [geo, setGeo] = useState<GeoLocationResult | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [shakeGps, setShakeGps] = useState(false);

  const [kategoriId, setKategoriId] = useState<number>(1);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [rt, setRt] = useState("01");
  const [rw, setRw] = useState("01");
  const [nama, setNama] = useState("");
  const [noWa, setNoWa] = useState("");
  const [isAnonim, setIsAnonim] = useState(false);

  const [fotoBlob, setFotoBlob] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const radarSectionRef = useRef<HTMLElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<any | null>(null);

  useEffect(() => {
    handleLocate();
  }, []);

  const triggerGpsShakeAndScroll = () => {
    setShakeGps(true);
    // Getar perangkat HP jika didukung (Vibration API)
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    // Scroll mulus ke card GPS di atas
    radarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setShakeGps(false), 800);
  };

  const handleLocate = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const res = await requestWargaLocation();
      setGeo(res);
    } catch (err: any) {
      setGeoError(err.message || "Gagal baca lokasi GPS");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setFotoBlob(blob);
              setFotoPreview(URL.createObjectURL(blob));
            }
          },
          "image/webp",
          0.7
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geo?.isInside) {
      alert("Lokasi kamu di luar Desa Rau! Hanya warga di area desa yang bisa mengirim aduan.");
      return;
    }

    setSubmitting(true);

    try {
      let uploadedUrl = null;

      if (fotoBlob) {
        const fileName = `rau_${Date.now()}.webp`;
        const uploadRes = await fetch(`/api/upload?name=${fileName}`, {
          method: "POST",
          body: fotoBlob,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedUrl = uploadData.url;
        }
      }

      const payload = {
        kategori_id: kategoriId,
        judul,
        deskripsi,
        rt,
        rw,
        nama_pelapor: isAnonim ? "Warga Rau (Anonim)" : nama || "Warga Rau",
        no_wa: noWa || null,
        is_anonim: isAnonim,
        lat: geo.lat,
        lng: geo.lng,
        foto_url: uploadedUrl,
      };

      const res = await fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan laporan");

      setTicketResult(json.data);
    } catch (err: any) {
      alert(err.message || "Gagal kirim aduan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-[#f6f5f0]">
      {/* Neo-Brutalism Header */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">
              LAPOR.RAU
            </h1>
          </div>
          <p className="text-[11px] text-[#ffe600] font-mono font-bold mt-0.5">
            BALAI DESA RAU • KEDUNG • JEPARA
          </p>
        </div>

        <Link
          href="/riwayat"
          className="nb-btn bg-[#ffe600] text-[#121212] text-xs font-black px-3 py-1.5 rounded uppercase flex items-center gap-1"
        >
          Pantau Aduan ➔
        </Link>
      </header>

      <main className="p-4 space-y-4 flex-1">
        {/* GPS Gate Neo-Brutalist Banner */}
        <section
          ref={radarSectionRef}
          className={`nb-box rounded-xl p-3.5 space-y-2 transition-all ${
            shakeGps ? "animate-shake ring-4 ring-rose-500" : ""
          } ${
            geoLoading
              ? "scanning-radar"
              : geo?.isInside
              ? "bg-[#a7f3d0]"
              : geoError
              ? "bg-[#ff99c8]"
              : "bg-[#fff]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 stroke-[3px]" />
              <span className="text-xs font-black uppercase tracking-wider">
                RADAR GPS DESA RAU
              </span>
            </div>

            <button
              type="button"
              onClick={handleLocate}
              disabled={geoLoading}
              className={`nb-btn text-[10px] font-black px-3 py-1.5 rounded-lg uppercase flex items-center gap-1.5 cursor-pointer ${
                geoLoading
                  ? "bg-[#ffe600] text-[#121212]"
                  : !geo?.isInside
                  ? "bg-[#ff99c8] text-[#121212] hover:bg-[#ffe600]"
                  : "bg-[#121212] text-white hover:bg-[#333]"
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 stroke-[3px] ${geoLoading ? "animate-spin" : ""}`} />
              {geoLoading ? "MEMINDAI..." : !geo?.isInside ? "CEK GPS SEKARANG" : "CEK ULANG"}
            </button>
          </div>

          <div>
            {geoLoading ? (
              <p className="text-xs font-bold flex items-center gap-1.5 py-0.5 font-mono">
                <Loader2 className="w-4 h-4 animate-spin stroke-[3px]" />
                Mencari sinyal satelit GPS...
              </p>
            ) : geoError ? (
              <p className="text-xs font-bold text-[#121212] leading-tight">
                ⚠️ {geoError}
              </p>
            ) : geo ? (
              <div className="space-y-0.5">
                <p className="text-xs font-black uppercase">
                  {geo.isInside ? "✓ LOKASI VALID: DI DESA RAU" : "✕ DI LUAR PERIMETER DESA"}
                </p>
                <p className="text-[11px] font-medium font-mono">
                  {geo.isInside
                    ? `Terdeteksi ~${geo.distanceMeter}m dari Balai Desa Rau. Siap lapor!`
                    : `Jarak kamu: ${geo.distanceMeter}m (Maksimal ${DESA_RAU.maxRadiusMeter}m). Hanya berlaku di Desa Rau.`}
                </p>
              </div>
            ) : (
              <p className="text-xs font-bold">Tekan tombol Cek GPS untuk membuka form.</p>
            )}
          </div>
        </section>

        {/* Modal Tiket Terkirim */}
        {ticketResult ? (
          <div className="nb-box bg-[#ffe600] rounded-2xl p-5 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-[#121212] text-[#ffe600] border-2 border-[#121212] rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-[3px_3px_0px_#121212]">
              ✓
            </div>

            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#121212] text-white rounded">
                TERCATAT RESMI
              </span>
              <h2 className="text-lg font-black text-[#121212] mt-1.5 uppercase leading-tight">
                ADUAN KAMU SUDAH MASUK!
              </h2>
              <p className="text-xs font-bold text-[#121212]/80 mt-1 leading-snug">
                Petugas balai desa akan segera mengecek dan menindaklanjuti.
              </p>
            </div>

            <div className="bg-white border-[2.5px] border-[#121212] shadow-[3px_3px_0px_#121212] rounded-xl p-3 text-left">
              <span className="text-[10px] font-black text-[#555] block uppercase">
                NOMOR TIKET PELACAKAN:
              </span>
              <span className="font-mono text-base font-black text-[#121212] tracking-wider">
                {ticketResult.kode_tiket}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href={`/lacak/${ticketResult.id}`}
                className="nb-btn flex-1 py-3 bg-[#121212] text-[#ffe600] font-black text-xs rounded-xl uppercase text-center"
              >
                Pantau Laporan ➔
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTicketResult(null);
                  setJudul("");
                  setDeskripsi("");
                  setFotoPreview(null);
                  setFotoBlob(null);
                }}
                className="nb-btn px-4 py-3 bg-white text-[#121212] font-black text-xs rounded-xl uppercase"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Pilih Kategori Masalah (Neo Bento Grid) */}
            <div className="nb-box rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-1.5">
                <span className="text-xs font-black uppercase tracking-wider">
                  1. PILIH KATEGORI MASALAH
                </span>
                <span className="text-[10px] font-bold font-mono bg-[#121212] text-white px-1.5 py-0.5 rounded">
                  WAJIB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {KATEGORI_ITEMS.map((item) => {
                  const isSelected = kategoriId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setKategoriId(item.id)}
                      className={`p-2.5 rounded-xl border-2 border-[#121212] text-left flex items-center gap-2 transition-all font-black ${
                        isSelected
                          ? `${item.bg} shadow-[3px_3px_0px_#121212] -translate-y-0.5`
                          : "bg-[#fff] hover:bg-[#fafafa] shadow-[1px_1px_0px_#121212]"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <span className="text-xs font-bold leading-tight line-clamp-2">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Isi Aduan */}
            <div className="nb-box rounded-2xl p-4 space-y-3">
              <div className="border-b-2 border-[#121212] pb-1.5">
                <span className="text-xs font-black uppercase tracking-wider">
                  2. DETAIL MASALAH
                </span>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase block mb-1">
                  Judul Singkat <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aspal jebol depan pos ronda"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="nb-input w-full h-11 px-3 rounded-lg text-xs font-bold bg-[#fff] placeholder:text-[#888]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase block mb-1">
                  Keterangan & Patokan Lokasi <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan kondisi dan patokan tempatnya secara jelas..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="nb-input w-full p-3 rounded-lg text-xs font-semibold bg-[#fff] placeholder:text-[#888] resize-none leading-relaxed"
                />
              </div>

              {/* Upload Foto */}
              <div>
                <label className="text-[11px] font-black uppercase block mb-1">
                  Foto Bukti (Kamera Langsung)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFotoChange}
                  className="hidden"
                />

                {fotoPreview ? (
                  <div className="relative border-2 border-[#121212] rounded-xl overflow-hidden shadow-[3px_3px_0px_#121212] bg-[#fff]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotoPreview} alt="Bukti" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFotoPreview(null);
                        setFotoBlob(null);
                      }}
                      className="absolute top-2 right-2 bg-[#ff99c8] border-2 border-[#121212] text-[#121212] font-black rounded-lg p-1 shadow-[2px_2px_0px_#121212] active:scale-90"
                    >
                      <X className="w-4 h-4 stroke-[3px]" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-[#ffe600] border-2 border-[#121212] px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-[2px_2px_0px_#121212]">
                      WebP Terkompresi (~50 KB)
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="nb-btn w-full h-16 bg-[#fff] hover:bg-[#ffe600] rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase"
                  >
                    <Camera className="w-5 h-5 stroke-[2.5px]" />
                    Jepret Foto / Pilih Galeri
                  </button>
                )}
              </div>
            </div>

            {/* 3. Lokasi RT/RW & Identitas */}
            <div className="nb-box rounded-2xl p-4 space-y-3">
              <div className="border-b-2 border-[#121212] pb-1.5">
                <span className="text-xs font-black uppercase tracking-wider">
                  3. WILAYAH & IDENTITAS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black uppercase block mb-1">RT</label>
                  <select
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    className="nb-input w-full h-11 px-3 rounded-lg text-xs font-black bg-white"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08"].map((v) => (
                      <option key={v} value={v}>
                        RT {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase block mb-1">RW</label>
                  <select
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="nb-input w-full h-11 px-3 rounded-lg text-xs font-black bg-white"
                  >
                    {["01", "02", "03", "04"].map((v) => (
                      <option key={v} value={v}>
                        RW {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Anonim Toggle */}
              <div className="nb-box-sm bg-[#e4c1f9] rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase block">
                    KIRIM SEBAGAI ANONIM?
                  </span>
                  <span className="text-[10px] font-bold text-[#121212]/80">
                    Nama disembunyikan dari publik
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonim}
                  onChange={(e) => setIsAnonim(e.target.checked)}
                  className="w-5 h-5 accent-[#121212] border-2 border-[#121212] rounded cursor-pointer"
                />
              </div>

              {!isAnonim && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nama Lengkap (opsional)"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="nb-input w-full h-11 px-3 rounded-lg text-xs font-bold bg-white placeholder:text-[#888]"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor WhatsApp (untuk kabar status)"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    className="nb-input w-full h-11 px-3 rounded-lg text-xs font-bold bg-white placeholder:text-[#888]"
                  />
                </div>
              )}
            </div>

            {/* Box Panduan & Pengingat GPS Khusus Warga */}
            <div className="nb-box-sm bg-[#fff] rounded-xl p-3 space-y-2 border-2 border-[#121212]">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase text-[#121212]">
                <MapPin className="w-4 h-4 text-emerald-700 stroke-[3px]" />
                <span>PANDUAN SEBELUM MENGIRIM:</span>
              </div>
              <ul className="text-[11px] font-bold text-[#333] space-y-1.5 pl-4 list-disc">
                <li>
                  <strong className="text-[#121212]">Wajib di Lokasi:</strong> Pastikan Anda sedang berada di Desa Rau saat mengirim laporan agar titik GPS akurat.
                </li>
                <li className="flex flex-col gap-1 items-start">
                  <span>
                    <strong className="text-[#121212]">GPS Belum Aktif / Tombol Mati?</strong>
                  </span>
                  <button
                    type="button"
                    onClick={triggerGpsShakeAndScroll}
                    className="nb-btn bg-[#ffe600] text-[#121212] px-2.5 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#121212]"
                  >
                    <RotateCw className="w-3 h-3 stroke-[3px]" />
                    Klik Di Sini: Aktifkan & Cek GPS ➔
                  </button>
                </li>
                <li>
                  <strong className="text-[#121212]">Verifikasi Balai Desa:</strong> Laporan akan masuk antrean petugas balai desa untuk ditinjau sebelum dipublikasikan.
                </li>
              </ul>
            </div>

            {/* Tombol Kirim Raksasa */}
            <div className="space-y-1">
              <button
                type="submit"
                onClick={(e) => {
                  if (!geo?.isInside) {
                    e.preventDefault();
                    triggerGpsShakeAndScroll();
                  }
                }}
                disabled={submitting}
                className={`w-full h-13 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 px-3 transition-all ${
                  geo?.isInside && !submitting
                    ? "nb-btn bg-[#ffe600] text-[#121212]"
                    : "nb-btn bg-[#ff99c8] text-[#121212] hover:bg-[#ff80b5]"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[3px]" />
                    MENGIRIM ADUAN...
                  </>
                ) : !geo?.isInside ? (
                  <>
                    <RotateCw className="w-4 h-4 stroke-[3px]" />
                    KLIK UNTUK CEK LOKASI GPS ➔
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[3px]" />
                    KIRIM KE BALAI DESA ➔
                  </>
                )}
              </button>

              {!geo?.isInside && (
                <p className="text-[10px] font-mono font-bold text-center text-rose-700 pt-0.5">
                  ⚠️ Wajib berada di Desa Rau & aktifkan GPS untuk mengirim.
                </p>
              )}
            </div>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
