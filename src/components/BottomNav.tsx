"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, LayoutGrid, Info } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Halaman publik warga (tombol Petugas/Admin disembunyikan total)
  const items = [
    { href: "/", label: "BERANDA", icon: Home },
    { href: "/lapor", label: "LAPOR", icon: PlusCircle },
    { href: "/riwayat", label: "PANTAU", icon: LayoutGrid },
    { href: "/info", label: "DESA", icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#f6f5f0] border-t-[3px] border-[#121212] z-40 px-3 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl border-2 transition-all font-black ${
              isActive
                ? "bg-[#ffe600] border-[#121212] text-[#121212] shadow-[2px_2px_0px_#121212] -translate-y-0.5"
                : "border-transparent text-[#555] hover:text-[#121212] hover:border-[#121212]"
            }`}
          >
            <Icon className="w-5 h-5 stroke-[2.5px]" />
            <span className="text-[10px] mt-0.5 tracking-wider font-extrabold uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
