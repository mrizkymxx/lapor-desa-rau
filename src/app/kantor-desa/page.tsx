"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Lock,
  RotateCw,
  Loader2,
  X,
  MapPin,
  Calendar,
  MessageCircle,
  Download,
  Camera,
  Check,
  Send,
  Phone,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { LaporanRow } from "@/lib/supabase";

export default function KantorDesaPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [laporan, setLaporan] = useState<LaporanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanRow | null>(null);

  // Form Tindak Lanjut
  const [statusInput, setStatusInput] = useState<"masuk" | "diproses" | "selesai" | "ditolak">("diproses");
  const [tanggapanInput, setTanggapanInput] = useState("");
  const [petugasNama, setPetugasNama] = useState("Kaur Perencanaan");
  const [fotoSelesaiBlob, setFotoSelesaiBlob] = useState<Blob | null>(null);
  const [fotoSelesaiPreview, setFotoSelesaiPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("kantor_rau_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchLaporan();
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "rau2026" || pin === "adminrau") {
      sessionStorage.setItem("kantor_rau_auth", "true");
      setIsAuthenticated(true);
      fetchLaporan();
    } else {
      alert("Kode PIN Petugas salah.");
    }
  };

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laporan");
      const json = await res.json();
      if (res.ok) {
        setLaporan(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFotoSelesaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              setFotoSelesaiBlob(blob);
              setFotoSelesaiPreview(URL.createObjectURL(blob));
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaporan) return;

    setSaving(true);
    try {
      let uploadedUrl = selectedLaporan.foto_selesai_url || null;

      if (fotoSelesaiBlob) {
        const fileName = `selesai_${Date.now()}.webp`;
        const uploadRes = await fetch(`/api/upload?name=${fileName}`, {
          method: "POST",
          body: fotoSelesaiBlob,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/laporan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLaporan.id,
          status: statusInput,
          tanggapan_petugas: tanggapanInput,
          petugas_nama: petugasNama,
          foto_selesai_url: uploadedUrl,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan");

      alert("Laporan berhasil diperbarui!");
      setSelectedLaporan(null);
      setFotoSelesaiBlob(null);
      setFotoSelesaiPreview(null);
      fetchLaporan();
    } catch (err: any) {
      alert(err.message || "Gagal menghubungi server");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (laporan.length === 0) {
      alert("Belum ada data untuk diekspor");
      return;
    }

    const headers = ["Kode Tiket", "Tanggal", "Kategori", "RT", "RW", "Judul", "Status", "Pelapor", "Tanggapan"];
    const rows = laporan.map((l) => [
      `"${l.kode_tiket}"`,
      `"${new Date(l.created_at).toLocaleDateString("id-ID")}"`,
      `"${l.kategori?.nama || "Umum"}"`,
      `"${l.rt}"`,
      `"${l.rw}"`,
      `"${l.judul.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.nama_pelapor}"`,
      `"${(l.tanggapan_petugas || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Aduan_Desa_Rau_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChatWarga = (l: LaporanRow) => {
    if (!l.no_wa) return;
    let cleanNumber = l.no_wa.replace(/[^0-9]/g, "");
    if (cleanNumber.startsWith("0")) cleanNumber = "62" + cleanNumber.slice(1);

    const message = encodeURIComponent(
      `Halo Bpk/Ibu ${l.nama_pelapor}, kami dari Pemerintah Desa Rau menindaklanjuti laporan Anda terkait "${l.judul}" (Tiket: ${l.kode_tiket}).`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  const countTotal = laporan.length;
  const countMenunggu = laporan.filter((l) => l.status === "masuk").length;
  const countDiproses = laporan.filter((l) => l.status === "diproses").length;
  const countSelesai = laporan.filter((l) => l.status === "selesai").length;

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col justify-center p-5 bg-[#f6f5f0]">
        <div className="nb-box bg-white rounded-2xl p-6 max-w-sm mx-auto w-full space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffe600] border-2 border-[#121212] flex items-center justify-center font-black shadow-[2px_2px_0px_#121212]">
              🔐
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-[#121212]">PORTAL PETUGAS</h2>
              <p className="text-xs font-bold text-[#666]">Pemerintah Desa Rau</p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <div>
              <label className="text-xs font-black uppercase block mb-1">
                PIN AKSES PENGELOLA
              </label>
              <input
                type="password"
                required
                placeholder="PIN Petugas"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="nb-input w-full h-11 px-3 rounded-lg text-sm text-center font-mono font-bold bg-white"
              />
            </div>
            <button
              type="submit"
              className="nb-btn w-full h-11 bg-[#121212] text-[#ffe600] font-black text-xs rounded-xl uppercase"
            >
              BUKA PANEL PETUGAS ➔
            </button>
            <p className="text-[10px] font-mono font-bold text-center text-[#666]">
              PIN default: <code className="bg-[#ffe600] px-1 py-0.5 rounded border border-[#121212]">rau2026</code>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-12 bg-[#f6f5f0]">
      {/* Header Admin */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="nb-btn bg-[#ffe600] text-[#121212] p-1 rounded-lg">
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          </Link>
          <div>
            <h1 className="text-base font-black tracking-tight uppercase leading-none">
              TRIAGE DESA RAU
            </h1>
            <p className="text-[11px] text-[#ffe600] font-mono font-bold mt-0.5">
              {countTotal} ADUAN TERCATAT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="nb-btn bg-[#a7f3d0] text-[#121212] text-xs font-black px-2.5 py-1.5 rounded uppercase flex items-center gap-1"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 stroke-[3px]" />
            CSV
          </button>
          <button
            type="button"
            onClick={fetchLaporan}
            disabled={loading}
            className="nb-btn bg-[#ffe600] text-[#121212] p-1.5 rounded-lg"
          >
            <RotateCw className={`w-4 h-4 stroke-[3px] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4 flex-1">
        {/* Metric Counter */}
        <div className="grid grid-cols-4 gap-1.5 text-center font-black">
          <div className="nb-box-sm bg-white rounded-xl p-2">
            <span className="text-[9px] uppercase text-[#666] block">TOTAL</span>
            <span className="text-base font-mono leading-none">{countTotal}</span>
          </div>
          <div className="nb-box-sm bg-[#ffe600] rounded-xl p-2">
            <span className="text-[9px] uppercase text-[#121212] block">TUNGGU</span>
            <span className="text-base font-mono leading-none">{countMenunggu}</span>
          </div>
          <div className="nb-box-sm bg-[#70d6ff] rounded-xl p-2">
            <span className="text-[9px] uppercase text-[#121212] block">PROSES</span>
            <span className="text-base font-mono leading-none">{countDiproses}</span>
          </div>
          <div className="nb-box-sm bg-[#a7f3d0] rounded-xl p-2">
            <span className="text-[9px] uppercase text-[#121212] block">BERES</span>
            <span className="text-base font-mono leading-none">{countSelesai}</span>
          </div>
        </div>

        {/* Modal Triage Editor */}
        {selectedLaporan && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="nb-box bg-white rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
                <div>
                  <span className="text-xs font-black uppercase text-[#121212] block">
                    TINDAK LANJUT ADUAN
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#666]">
                    {selectedLaporan.kode_tiket}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLaporan(null)}
                  className="nb-btn bg-[#ff99c8] p-1 rounded-lg"
                >
                  <X className="w-4 h-4 stroke-[3px]" />
                </button>
              </div>

              <div className="nb-box-sm bg-[#ffe600] p-2.5 rounded-xl text-xs space-y-2">
                <div>
                  <p className="font-black text-[#121212] uppercase">{selectedLaporan.judul}</p>
                  <p className="text-xs font-medium text-[#121212] mt-0.5">{selectedLaporan.deskripsi}</p>
                </div>

                {/* Foto Lampiran dari Warga (Jika Ada) */}
                {selectedLaporan.foto_url && (
                  <div className="rounded-lg border-2 border-[#121212] overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedLaporan.foto_url}
                      alt="Foto Aduan Warga"
                      className="w-full h-36 object-cover"
                    />
                  </div>
                )}

                <div className="pt-1.5 border-t border-[#121212] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold">
                    RT {selectedLaporan.rt} / RW {selectedLaporan.rw} • {selectedLaporan.nama_pelapor}
                  </span>
                  {selectedLaporan.no_wa && (
                    <button
                      type="button"
                      onClick={() => handleChatWarga(selectedLaporan)}
                      className="nb-btn bg-[#a7f3d0] text-[#121212] px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      Chat WA
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="text-xs font-black uppercase block mb-1">
                    UBAH STATUS
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e: any) => setStatusInput(e.target.value)}
                    className="nb-input w-full h-10 px-2.5 rounded-lg text-xs font-black bg-white"
                  >
                    <option value="masuk">MENUNGGU TINDAK LANJUT</option>
                    <option value="diproses">SEDANG DIPROSES / DIKERJAKAN</option>
                    <option value="selesai">BERES / SELESAI</option>
                    <option value="ditolak">DITOLAK / TIDAK RELEVAN</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase block mb-1">
                    TANGGAPAN PETUGAS DESA <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan keterangan tindakan atau pengerjaan lapangan..."
                    value={tanggapanInput}
                    onChange={(e) => setTanggapanInput(e.target.value)}
                    className="nb-input w-full p-2.5 rounded-lg text-xs font-semibold bg-white resize-none leading-relaxed"
                  />
                </div>

                {/* Upload Foto Bukti Selesai */}
                <div>
                  <label className="text-xs font-black uppercase block mb-1">
                    FOTO BUKTI SELESAI (OPSIONAL)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFotoSelesaiChange}
                    className="hidden"
                  />

                  {fotoSelesaiPreview ? (
                    <div className="relative border-2 border-[#121212] rounded-xl overflow-hidden shadow-[2px_2px_0px_#121212] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoSelesaiPreview} alt="Bukti Selesai" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFotoSelesaiPreview(null);
                          setFotoSelesaiBlob(null);
                        }}
                        className="absolute top-1.5 right-1.5 bg-[#ff99c8] p-1 rounded border border-[#121212]"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3px]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="nb-btn w-full h-12 bg-white hover:bg-[#ffe600] rounded-xl flex items-center justify-center gap-1.5 text-xs font-black uppercase"
                    >
                      <Camera className="w-4 h-4 stroke-[2.5px]" />
                      Upload Foto Perbaikan
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-black uppercase block mb-1">
                    NAMA PETUGAS / JABATAN
                  </label>
                  <input
                    type="text"
                    required
                    value={petugasNama}
                    onChange={(e) => setPetugasNama(e.target.value)}
                    className="nb-input w-full h-10 px-3 rounded-lg text-xs font-bold bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="nb-btn flex-1 h-11 bg-[#121212] text-[#ffe600] font-black text-xs rounded-xl uppercase flex items-center justify-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin stroke-[3px]" />}
                    SIMPAN & UMUMKAN ➔
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLaporan(null)}
                    className="nb-btn px-3 h-11 bg-white text-[#121212] font-black text-xs rounded-xl uppercase"
                  >
                    BATAL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Antrean Laporan */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#121212] gap-2">
            <Loader2 className="w-6 h-6 animate-spin stroke-[3px]" />
            <span className="text-xs font-mono font-bold uppercase">Memuat antrean...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {laporan.map((item) => (
              <div
                key={item.id}
                className="nb-box bg-white rounded-2xl p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-black text-[#666] block">
                      {item.kode_tiket}
                    </span>
                    <h2 className="text-xs font-black text-[#121212] leading-tight mt-0.5">
                      {item.judul}
                    </h2>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {item.foto_url && (
                  <div className="relative rounded-lg border border-[#121212] overflow-hidden h-24 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.foto_url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-xs font-medium text-[#555] line-clamp-2">
                  {item.deskripsi}
                </p>

                <div className="pt-2 border-t-2 border-[#121212] flex items-center justify-between text-[11px] font-black">
                  <span className="font-mono">
                    RT {item.rt} / RW {item.rw} • {item.nama_pelapor}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.no_wa && (
                      <button
                        type="button"
                        onClick={() => handleChatWarga(item)}
                        className="nb-btn bg-[#a7f3d0] text-[#121212] px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        WA
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLaporan(item);
                        setStatusInput(item.status);
                        setTanggapanInput(item.tanggapan_petugas || "");
                        setPetugasNama(item.petugas_nama || "Kaur Perencanaan");
                      }}
                      className="nb-btn bg-[#ffe600] px-2.5 py-0.5 rounded text-[10px] uppercase"
                    >
                      Tindak Lanjut ➔
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
