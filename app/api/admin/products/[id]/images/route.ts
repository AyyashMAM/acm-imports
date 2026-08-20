import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/products/[id]/images">
) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await ctx.params;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "A valid image file is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);

  const { data: existing } = await supabaseAdmin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data: image, error: insertError } = await supabaseAdmin
    .from("product_images")
    .insert({
      product_id: productId,
      url: publicUrl,
      storage_path: path,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not save image" }, { status: 500 });
  }

  return NextResponse.json(image);
}
