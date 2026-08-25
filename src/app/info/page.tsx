import { BottomNav } from "@/components/BottomNav";
import { Clock, Building2, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="flex-1 flex flex-col pb-24 bg-[#f6f5f0]">
      {/* Header */}
      <header className="bg-[#121212] text-[#f6f5f0] p-4 border-b-[3px] border-[#121212]">
        <h1 className="text-lg font-black uppercase tracking-tight leading-none">
          BALAI DESA RAU
        </h1>
        <p className="text-[11px] text-[#ffe600] font-mono font-bold mt-0.5">
          KEC. KEDUNG • KAB. JEPARA
        </p>
      </header>

      <main className="p-4 space-y-4 flex-1 text-xs text-[#121212]">
        {/* Banner Profil */}
        <section className="nb-box bg-white rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-2.5">
            <div className="w-11 h-11 rounded-xl bg-[#ffe600] border-2 border-[#121212] flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#121212]">
              🏛️
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-[#121212]">KANTOR BALAI DESA RAU</h2>
              <p className="text-[11px] font-bold text-[#666]">Pusat Pelayanan & Pengaduan Warga</p>
            </div>
          </div>

          <p className="font-medium text-[#333] leading-relaxed pt-1">
            <strong>lapor.rau</strong> adalah aplikasi pengaduan warga berbasis lokasi presisi untuk mempercepat penanganan masalah jalan, lampu, sampah, dan ketertiban desa.
          </p>
        </section>

        {/* Jam Layanan */}
        <section className="nb-box bg-white rounded-2xl p-4 space-y-2">
          <span className="text-xs font-black uppercase text-[#121212] block border-b-2 border-[#121212] pb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 stroke-[3px]" />
            JAM KERJA PELAYANAN
          </span>

          <div className="space-y-1.5 pt-1 font-mono font-bold text-xs">
            <div className="flex justify-between py-1 border-b border-[#ddd]">
              <span>SENIN – KAMIS</span>
              <span className="bg-[#ffe600] px-1.5 py-0.2 rounded border border-[#121212]">08:00 – 14:00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#ddd]">
              <span>JUMAT</span>
              <span className="bg-[#70d6ff] px-1.5 py-0.2 rounded border border-[#121212]">08:00 – 11:00</span>
            </div>
            <div className="flex justify-between py-1">
              <span>SABTU – MINGGU</span>
              <span className="bg-[#ff99c8] px-1.5 py-0.2 rounded border border-[#121212]">LIBUR</span>
            </div>
          </div>
        </section>

        {/* Ketentuan Geofence */}
        <section className="nb-box bg-[#a7f3d0] rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-black uppercase text-[#121212] block border-b-2 border-[#121212] pb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 stroke-[3px]" />
            EKSKLUSIF WARGA DESA RAU
          </span>
          <p className="font-semibold text-xs leading-relaxed text-[#121212]">
            Sistem otomatis mengecek sensor GPS kamu (maksimal radius 2.0 km dari Balai Desa Rau) agar aduan yang masuk murni dari warga di lingkungan desa.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
