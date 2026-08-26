export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export type AdminProductVariant = {
  id: string;
  label: string;
  sku: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  is_active: boolean;
};

export type AdminProductImage = {
  id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  attributes: Record<string, string | boolean>;
  base_price: number;
  is_active: boolean;
  created_at: string;
  product_images: AdminProductImage[];
  product_variants: AdminProductVariant[];
};

export type OrderItem = {
  id: string;
  product_variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  unit_cost: number | null;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  payment_method: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  city: string;
  notes: string | null;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
};

export type AdminCustomer = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
};
