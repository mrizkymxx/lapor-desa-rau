import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// In-Memory Rate Limiter (Max 5 request per jam per IP)
const ipRequestMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    ipRequestMap.set(ip, { count: 1, expiresAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (entry.count >= 5) {
    return true;
  }

  entry.count++;
  return false;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const kategori = url.searchParams.get("kategori");
    const search = url.searchParams.get("q");

    let query = supabase
      .from("laporan")
      .select("*, kategori:kategori_id(id, nama, slug, ikon)")
      .order("created_at", { ascending: false });

    if (status && status !== "semua") {
      query = query.eq("status", status);
    }

    if (kategori && kategori !== "semua") {
      query = query.eq("kategori_id", kategori);
    }

    if (search) {
      query = query.or(`judul.ilike.%${search}%,deskripsi.ilike.%${search}%,kode_tiket.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Cek Rate Limiter
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak aduan dikirim. Demi keamanan, batas maksimal 5 aduan per jam." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const {
      kategori_id,
      judul,
      deskripsi,
      foto_url,
      rt,
      rw,
      nama_pelapor,
      no_wa,
      is_anonim,
      lat,
      lng,
    } = body;

    if (!judul || !deskripsi || !lat || !lng || !rt || !rw) {
      return NextResponse.json(
        { error: "Data input tidak lengkap atau koordinat lokasi belum ada." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("laporan")
      .insert([
        {
          kategori_id: Number(kategori_id),
          judul,
          deskripsi,
          foto_url,
          rt: String(rt).padStart(2, "0"),
          rw: String(rw).padStart(2, "0"),
          nama_pelapor: is_anonim ? "Warga Rau (Anonim)" : nama_pelapor || "Warga Rau",
          no_wa,
          is_anonim: Boolean(is_anonim),
          lat: Number(lat),
          lng: Number(lng),
          status: "masuk",
        },
      ])
      .select("*, kategori:kategori_id(id, nama, slug, ikon)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, tanggapan_petugas, petugas_nama, foto_selesai_url } = body;

    if (!id) {
      return NextResponse.json({ error: "ID laporan dibutuhkan." }, { status: 400 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (tanggapan_petugas !== undefined) {
      updatePayload.tanggapan_petugas = tanggapan_petugas;
      updatePayload.tgl_ditanggapi = new Date().toISOString();
    }
    if (petugas_nama) updatePayload.petugas_nama = petugas_nama;
    if (foto_selesai_url) updatePayload.foto_selesai_url = foto_selesai_url;

    const { data, error } = await supabase
      .from("laporan")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
