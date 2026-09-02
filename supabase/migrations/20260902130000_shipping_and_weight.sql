-- Per-product weight (kg), used to calculate the courier fee at checkout:
-- Rs 425 for the first kg, +Rs 100 per additional kg (rounded up), applied
-- once to the combined weight of everything in the order.
--
-- Nullable first so the column can be added without failing on existing
-- rows, backfilled to a safe default, then locked down. Going forward the
-- admin product form requires a real value for every new/edited product.
alter table products add column weight_kg numeric(10, 3);
update products set weight_kg = 1 where weight_kg is null;
alter table products alter column weight_kg set not null;
alter table products add constraint products_weight_kg_check check (weight_kg > 0);

-- Shipping fee actually charged on the order (computed server-side at
-- checkout from the combined weight of its items), stored separately from
-- total_amount so reporting can tell merchandise revenue apart from the
-- pass-through courier charge.
alter table orders
  add column shipping_fee numeric(10, 2) not null default 0 check (shipping_fee >= 0);
