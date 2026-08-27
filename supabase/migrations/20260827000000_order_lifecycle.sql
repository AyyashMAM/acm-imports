-- Human-readable order numbers, assigned atomically via a sequence so
-- concurrent checkouts can't collide. A single global sequence (not reset
-- per year) — simplest, and irrelevant at this store's volume.
create sequence order_number_seq;

alter table orders add column order_number text;

update orders set order_number =
  'LIORA-' || extract(year from created_at)::int || '-' || lpad(nextval('order_number_seq')::text, 5, '0')
  where order_number is null;

alter table orders alter column order_number set not null;
alter table orders add constraint orders_order_number_key unique (order_number);
create index orders_order_number_idx on orders (order_number);

create function set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'LIORA-' || extract(year from now())::int || '-' || lpad(nextval('order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger orders_set_order_number
  before insert on orders
  for each row execute function set_order_number();

-- Cancellation reason (shown to the customer, kept for the admin's own
-- record), and courier/tracking info captured when an order ships.
alter table orders add column cancellation_reason text;
alter table orders add column courier_name text;
alter table orders add column tracking_number text;

-- Widen status to add the "processing" stage between confirmed and shipped.
-- Existing rows/values are unaffected — this only adds an allowed value.
alter table orders drop constraint orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
