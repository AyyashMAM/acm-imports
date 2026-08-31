import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isUploadableImage, uploadProductImage } from "@/lib/admin/product-images";

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

  if (!isUploadableImage(file)) {
    return NextResponse.json({ error: "A valid image file is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const image = await uploadProductImage(productId, file, nextSortOrder);
  if (!image) {
    return NextResponse.json({ error: "Could not save image" }, { status: 500 });
  }

  return NextResponse.json(image);
}
