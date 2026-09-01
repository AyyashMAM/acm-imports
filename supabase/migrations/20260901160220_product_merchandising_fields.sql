-- Product-level SKU, sale pricing, draft/published/archived status, and
-- cruelty-free/vegan badges; per-variant expiry (batch) date for stock
-- rotation. All additive/nullable-or-defaulted so existing products,
-- variants, and orders are unaffected.

alter table products
  add column sku text,
  add column is_on_sale boolean not null default false,
  add column sale_price numeric(10, 2) check (sale_price >= 0),
  add column cruelty_free boolean not null default false,
  add column vegan boolean not null default false,
  add column status text not null default 'published'
    check (status in ('draft', 'published', 'archived'));

-- Multiple products can have no SKU (null), but a given SKU string can't be
-- reused across products. Partial index so nulls don't collide.
create unique index products_sku_key on products (sku) where sku is not null;

-- Backfill status from the existing is_active flag so current storefront
-- visibility doesn't change. Going forward, is_active is kept in sync by the
-- admin app whenever status changes (published -> true, else false), so the
-- existing "Public can read active products" RLS policy needs no changes.
update products set status = case when is_active then 'published' else 'draft' end;

alter table product_variants
  add column expiry_date date;

-- Best-effort carry-over of the old Cosmetics/Chocolate "Expiry date"
-- category attribute (free text inside products.attributes jsonb) onto the
-- new typed per-variant column, applied to all of that product's variants.
-- Only touches values that already look like an ISO date; anything else is
-- left alone rather than risk a bad cast.
update product_variants v
set expiry_date = (p.attributes ->> 'expiry_date')::date
from products p
where v.product_id = p.id
  and p.attributes ->> 'expiry_date' is not null
  and p.attributes ->> 'expiry_date' ~ '^\d{4}-\d{2}-\d{2}$';
