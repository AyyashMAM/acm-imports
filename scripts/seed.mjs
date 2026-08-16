// Seeds a few demo products for local testing.
// Run with: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const products = [
  {
    name: "Ceramic Coffee Mug",
    description: "Imported stoneware mug, dishwasher safe.",
    category: "Kitchen",
    base_price: 8.99,
    image: "https://placehold.co/600x600.png?text=Coffee+Mug",
    variants: [
      { label: "White", price: 8.99, stock_quantity: 25 },
      { label: "Black", price: 8.99, stock_quantity: 15 },
    ],
  },
  {
    name: "Wireless Earbuds",
    description: "Bluetooth 5.3 earbuds with charging case.",
    category: "Electronics",
    base_price: 24.99,
    image: "https://placehold.co/600x600.png?text=Earbuds",
    variants: [{ label: "Standard", price: 24.99, stock_quantity: 10 }],
  },
  {
    name: "Cotton T-Shirt",
    description: "Soft imported cotton, unisex fit.",
    category: "Apparel",
    base_price: 12.99,
    image: "https://placehold.co/600x600.png?text=T-Shirt",
    variants: [
      { label: "Small", price: 12.99, stock_quantity: 20 },
      { label: "Medium", price: 12.99, stock_quantity: 20 },
      { label: "Large", price: 12.99, stock_quantity: 15 },
    ],
  },
];

for (const p of products) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: p.name,
      description: p.description,
      category: p.category,
      base_price: p.base_price,
    })
    .select("id")
    .single();

  if (productError) {
    console.error(`Failed to insert ${p.name}:`, productError.message);
    continue;
  }

  await supabase
    .from("product_images")
    .insert({ product_id: product.id, url: p.image, sort_order: 0 });

  await supabase.from("product_variants").insert(
    p.variants.map((v) => ({
      product_id: product.id,
      label: v.label,
      price: v.price,
      stock_quantity: v.stock_quantity,
    }))
  );

  console.log(`Seeded: ${p.name}`);
}
