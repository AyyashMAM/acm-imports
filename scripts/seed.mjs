// Seeds a few demo products for local testing.
// Run with: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const products = [
  {
    name: "Matte Liquid Lipstick",
    description: "Long-wear imported matte lipstick, transfer-resistant.",
    category: "Cosmetics",
    base_price: 2990,
    image: "https://placehold.co/600x600.png?text=Lipstick",
    variants: [
      { label: "Rose Nude", price: 2990, stock_quantity: 25 },
      { label: "Cherry Red", price: 2990, stock_quantity: 18 },
    ],
  },
  {
    name: "Korean Sheet Mask Set",
    description: "Hydrating imported sheet masks, pack of 5.",
    category: "Cosmetics",
    base_price: 4490,
    image: "https://placehold.co/600x600.png?text=Sheet+Masks",
    variants: [{ label: "Set of 5", price: 4490, stock_quantity: 30 }],
  },
  {
    name: "Assorted Belgian Chocolate Box",
    description: "Imported Belgian chocolate assortment, 24 pieces.",
    category: "Chocolate",
    base_price: 5990,
    image: "https://placehold.co/600x600.png?text=Chocolate+Box",
    variants: [{ label: "24 pcs", price: 5990, stock_quantity: 20 }],
  },
  {
    name: "Pearl Hair Clip Set",
    description: "Fancy imported pearl hair clips, set of 3.",
    category: "Fancy Items",
    base_price: 1990,
    image: "https://placehold.co/600x600.png?text=Hair+Clips",
    variants: [
      { label: "Ivory", price: 1990, stock_quantity: 20 },
      { label: "Gold", price: 1990, stock_quantity: 20 },
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
