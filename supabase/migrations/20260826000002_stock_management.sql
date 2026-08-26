-- Configurable low-stock threshold (global default + optional per-variant
-- override), an audit log for manual stock adjustments, and an atomic
-- decrement function so checkout can no longer oversell a variant that two
-- customers race to buy the last unit of (the previous read-then-write loop
-- in app/checkout/actions.ts had a gap between reading stock_quantity and
-- writing it back).

alter table product_variants
  add column low_stock_threshold int check (low_stock_threshold >= 0);

create table store_settings (
  id boolean primary key default true check (id),
  low_stock_threshold int not null default 5
);

insert into store_settings (id) values (true)
on conflict (id) do nothing;

create table stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references product_variants (id) on delete cascade,
  delta int not null check (delta <> 0),
  reason text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_adjustments_variant_id_idx on stock_adjustments (product_variant_id);

alter table stock_adjustments enable row level security;
-- No anon/authenticated policies: admin-only, accessed server-side via the
-- service_role key, mirroring the existing catalog-mutation pattern.

-- Guarded, atomic decrement: only succeeds (and only decrements) if enough
-- stock is currently available, so concurrent checkouts can't both succeed
-- on the last unit.
create function decrement_variant_stock(p_variant_id uuid, p_quantity int)
returns boolean
language plpgsql
as $$
declare
  updated_rows int;
begin
  update product_variants
  set stock_quantity = stock_quantity - p_quantity
  where id = p_variant_id and stock_quantity >= p_quantity;

  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;
