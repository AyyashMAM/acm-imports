-- Products, variants, images, and orders (cash on delivery, guest checkout)

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  label text not null, -- e.g. "Red / Large"
  sku text,
  price numeric(10, 2) not null check (price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'cod' check (payment_method in ('cod')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  city text not null,
  notes text,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_variant_id uuid references product_variants (id) on delete set null,
  product_name text not null, -- snapshot at time of order
  variant_label text, -- snapshot at time of order
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0)
);

create index product_images_product_id_idx on product_images (product_id);
create index product_variants_product_id_idx on product_variants (product_id);
create index order_items_order_id_idx on order_items (order_id);

-- Row Level Security
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public (anon) can browse active products/variants/images
create policy "Public can read active products"
  on products for select
  using (is_active = true);

create policy "Public can read product images"
  on product_images for select
  using (true);

create policy "Public can read active variants"
  on product_variants for select
  using (is_active = true);

-- Public (anon) can place orders (guest checkout) but cannot read/update/delete any orders
create policy "Public can create orders"
  on orders for insert
  with check (true);

create policy "Public can create order items"
  on order_items for insert
  with check (true);

-- No select/update/delete policies for anon on orders/order_items:
-- admin access happens server-side via the service_role key, which bypasses RLS.
-- No insert/update/delete policies for anon on products/product_images/product_variants:
-- catalog is managed server-side via the service_role key.
