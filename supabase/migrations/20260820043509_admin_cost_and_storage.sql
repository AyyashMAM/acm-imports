-- Cost price for profit reporting, and product image storage bucket

-- Per-variant cost (not per-product), used for profit reporting. Nullable: existing
-- variants and any created before an admin sets a cost won't have one yet; the sales
-- report treats a missing cost as unknown (coalesced to 0), which understates cost/
-- overstates profit until the admin fills it in.
alter table product_variants
  add column cost_price numeric(10, 2) check (cost_price >= 0);

-- Snapshot cost at order time, mirroring the existing unit_price/product_name/variant_label
-- snapshot pattern, so historical profit stays accurate even if cost_price changes later.
-- Nullable: orders placed before this column existed have no cost snapshot.
alter table order_items
  add column unit_cost numeric(10, 2) check (unit_cost >= 0);

-- Storage path for the uploaded object, distinct from the public url, so deletes don't
-- have to parse the object path back out of a URL. Nullable: existing seeded rows use
-- placehold.co URLs and were never uploaded to Storage.
alter table product_images
  add column storage_path text;

-- Public-read bucket for admin-uploaded product images. Public buckets serve reads via
-- the public object URL without going through RLS; all writes happen server-side via the
-- service_role key (supabaseAdmin), so no storage.objects RLS policies are needed for
-- anon/authenticated roles (mirrors the existing "catalog mutation only via service role"
-- pattern for products/product_images/product_variants).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
