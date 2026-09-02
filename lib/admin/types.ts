import type { OrderStatus } from "@/lib/order-status";

export type { OrderStatus } from "@/lib/order-status";
export { ORDER_STATUSES } from "@/lib/order-status";

export type AdminProductVariant = {
  id: string;
  label: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  expiry_date: string | null;
  is_active: boolean;
};

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export function isProductStatus(value: unknown): value is ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus);
}

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
  attributes: Record<string, string | boolean | string[]>;
  base_price: number;
  weight_kg: number;
  brand: string | null;
  benefits: string | null;
  how_to_use: string | null;
  ingredients: string | null;
  is_active: boolean;
  sku: string | null;
  status: ProductStatus;
  is_on_sale: boolean;
  sale_price: number | null;
  cruelty_free: boolean;
  vegan: boolean;
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
  order_number: string;
  status: OrderStatus;
  payment_method: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  city: string;
  notes: string | null;
  cancellation_reason: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  shipping_fee: number;
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
