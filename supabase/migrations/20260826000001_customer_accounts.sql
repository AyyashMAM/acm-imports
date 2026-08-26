-- Links orders to accounts (nullable: guest checkout keeps working with no
-- user_id), and adds saved addresses + a wishlist for the customer account
-- section. All new tables are owner-scoped via RLS so the account pages can
-- read/write with the regular authenticated client instead of the
-- service-role client used by admin/checkout.

alter table orders
  add column user_id uuid references auth.users (id) on delete set null;

create index orders_user_id_idx on orders (user_id);

create policy "Users can read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can read own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on addresses (user_id);

alter table addresses enable row level security;

create policy "Users manage own addresses"
  on addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlist_items_user_id_idx on wishlist_items (user_id);

alter table wishlist_items enable row level security;

create policy "Users manage own wishlist"
  on wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
