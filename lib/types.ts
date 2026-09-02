export type ProductImage = {
  id: string;
  url: string;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock_quantity: number;
};

export type Product = {
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
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  price: number;
  weightKg: number;
  quantity: number;
  imageUrl: string | null;
};
