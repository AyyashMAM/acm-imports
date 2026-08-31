import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;

export function isUploadableImage(file: unknown): file is File {
  return file instanceof File && file.size > 0 && file.type.startsWith("image/");
}

export async function uploadProductImage(
  productId: string,
  file: File,
  sortOrder: number
) {
  if (!isUploadableImage(file) || file.size > MAX_BYTES) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) return null;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);

  const { data: image, error: insertError } = await supabaseAdmin
    .from("product_images")
    .insert({
      product_id: productId,
      url: publicUrl,
      storage_path: path,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (insertError) return null;
  return image;
}
