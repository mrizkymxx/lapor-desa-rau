import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import LacakClient from "./LacakClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // Ambil data laporan di server untuk OpenGraph Preview WhatsApp (Rp 0)
  const { data: laporan } = await supabase
    .from("laporan")
    .select("*, kategori:kategori_id(nama)")
    .or(`id.eq.${id},kode_tiket.eq.${id}`)
    .maybeSingle();

  if (!laporan) {
    return {
      title: "Laporan Tidak Ditemukan — Lapor Desa Rau",
    };
  }

  const statusLabel =
    laporan.status === "selesai"
      ? "Selesai Dikerjakan ✓"
      : laporan.status === "diproses"
      ? "Sedang Dikerjakan"
      : "Menunggu Tindak Lanjut";

  const imageUrl =
    laporan.foto_selesai_url ||
    laporan.foto_url ||
    "https://lapor-desa-rau.vercel.app/icon-512.svg";

  return {
    title: `[${statusLabel}] ${laporan.judul}`,
    description: `Laporan warga RT ${laporan.rt}/RW ${laporan.rw} Desa Rau (Tiket: ${laporan.kode_tiket}). Pantau tindak lanjut balai desa.`,
    openGraph: {
      title: `[${statusLabel}] ${laporan.judul}`,
      description: `Laporan warga RT ${laporan.rt}/RW ${laporan.rw} Desa Rau (Tiket: ${laporan.kode_tiket})`,
      url: `https://lapor-desa-rau.vercel.app/lacak/${id}`,
      siteName: "Lapor Desa Rau",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: laporan.judul,
        },
      ],
      locale: "id_ID",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `[${statusLabel}] ${laporan.judul}`,
      description: `Laporan warga RT ${laporan.rt}/RW ${laporan.rw} Desa Rau`,
      images: [imageUrl],
    },
  };
}

export default async function LacakPage({ params }: Props) {
  const { id } = await params;
  return <LacakClient id={id} />;
}
