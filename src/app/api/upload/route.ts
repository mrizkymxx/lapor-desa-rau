import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("name") || `upload_${Date.now()}.webp`;

    const blob = await req.blob();
    if (!blob || blob.size === 0) {
      return NextResponse.json({ error: "File tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from("laporan-media")
      .upload(fileName, blob, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("laporan-media")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal upload" }, { status: 500 });
  }
}
