"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Loader2, ChevronRight, MessageSquare, Plus, Image as ImageIcon, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { BottomNav } from "@/components/BottomNav";
import { LaporanRow } from "@/lib/supabase";

export default function RiwayatPage() {
  const [laporan, setLaporan] = useState<LaporanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLaporan();
  }, [statusFilter]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      let url = `/api/laporan?status=${statusFilter}`;
      if (search) url += `&q=${encodeURIComponent(search)}`;

      const res = await fetch(url);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLaporan();
  };

  // Hanya filter status yang lolos verifikasi publik
  const STATUS_TABS = [
    { id: "semua", label: "SEMUA", color: "bg-white" },
    { id: "diproses", label: "DIPROSES", color: "bg-[#70d6ff]" },
    { id: "selesai", label: "SELESAI", color: "bg-[#a7f3d0]" },
  ];

  return (
    <div className="flex-1 flex flex-col pb-24 bg-[#f6f5f0]">
      {/* Neo Header */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase leading-none">
            PAPAN ASPIRASI
          </h1>
          <p className="text-[11px] text-[#ffe600] font-mono font-bold mt-0.5">
            LAPORAN TERVERIFIKASI BALAI DESA
          </p>
        </div>

        <Link
          href="/lapor"
          className="nb-btn bg-[#ffe600] text-[#121212] text-xs font-black px-3 py-1.5 rounded uppercase flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
          Lapor
        </Link>
      </header>

      <main className="p-4 space-y-3 flex-1">
        {/* Info Banner Moderasi */}
        <div className="nb-box-sm bg-[#e4c1f9] rounded-xl p-2.5 text-[11px] font-bold text-[#121212] flex items-center gap-2">
          <span>🛡️</span>
          <span>Hanya laporan yang telah diverifikasi perangkat desa yang tampil di papan ini.</span>
        </div>

        {/* Neo Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Cari kode tiket / masalah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="nb-input w-full h-11 pl-9 pr-3 rounded-xl text-xs font-bold bg-[#fff] placeholder:text-[#777]"
          />
          <Search className="w-4 h-4 text-[#121212] stroke-[2.5px] absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        {/* Neo Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-lg border-2 border-[#121212] transition-all whitespace-nowrap ${
                  active
                    ? `${tab.color} text-[#121212] shadow-[2.5px_2.5px_0px_#121212] -translate-y-0.5`
                    : "bg-white text-[#666] hover:text-[#121212]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List Neo Cards */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#121212] gap-2">
            <Loader2 className="w-6 h-6 animate-spin stroke-[3px]" />
            <span className="text-xs font-mono font-bold uppercase">Memuat data aduan...</span>
          </div>
        ) : laporan.length === 0 ? (
          <div className="nb-box rounded-2xl p-8 text-center bg-white space-y-2">
            <span className="text-3xl">📭</span>
            <p className="text-sm font-black uppercase">BELUM ADA LAPORAN AKTIF</p>
            <p className="text-xs font-bold text-[#666]">Laporan yang telah diverifikasi balai desa akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {laporan.map((item) => (
              <Link
                key={item.id}
                href={`/lacak/${item.id}`}
                className="block nb-box bg-white rounded-2xl p-4 transition-all hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-[#121212] text-[#f6f5f0] px-2 py-0.5 rounded">
                    {item.kategori?.nama || "UMUM"}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <h2 className="text-sm font-black text-[#121212] leading-snug line-clamp-2">
                  {item.judul}
                </h2>

                <p className="text-xs font-semibold text-[#555] line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>

                {/* Thumbnail Gambar Bukti Langsung di List */}
                {item.foto_url && (
                  <div className="relative rounded-xl border-2 border-[#121212] overflow-hidden bg-slate-100 h-36 shadow-[2px_2px_0px_#121212]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.foto_url}
                      alt="Thumbnail Bukti"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#121212]/80 text-[#ffe600] px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 font-mono">
                      <ImageIcon className="w-3 h-3" />
                      FOTO LAPORAN
                    </div>
                  </div>
                )}

                {item.tanggapan_petugas && (
                  <div className="nb-box-sm bg-[#a7f3d0] rounded-xl p-2.5 text-xs text-[#121212] space-y-0.5">
                    <span className="font-black text-[11px] block uppercase flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 stroke-[3px]" />
                      Balasan {item.petugas_nama || "Balai Desa"}:
                    </span>
                    <p className="line-clamp-2 font-medium">{item.tanggapan_petugas}</p>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-[#121212] flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 stroke-[2.5px]" />
                    RT {item.rt} / RW {item.rw}
                  </span>
                  <span className="font-mono bg-[#ffe600] border-2 border-[#121212] px-1.5 py-0.2 rounded shadow-[1.5px_1.5px_0px_#121212] flex items-center gap-0.5">
                    {item.kode_tiket}
                    <ChevronRight className="w-3 h-3 stroke-[3px]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
