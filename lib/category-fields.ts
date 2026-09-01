// Shared between admin (forms) and storefront (spec display) — keep free of
// server-only or client-only imports.

export const PRODUCT_CATEGORIES = [
  "Cosmetics",
  "Chocolate",
  "Fancy Items",
  "Household Items",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: unknown): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

export type CategoryFieldType = "text" | "textarea" | "date" | "select" | "checkbox" | "multiselect";

export type CategoryField = {
  key: string;
  label: string;
  type: CategoryFieldType;
  placeholder?: string;
  options?: string[];
};

export const CATEGORY_FIELDS: Record<ProductCategory, CategoryField[]> = {
  Cosmetics: [
    {
      key: "skin_types",
      label: "Skin type",
      type: "multiselect",
      options: ["Oily", "Dry", "Combination", "Normal", "All skin types"],
    },
    {
      key: "net_weight",
      label: "Net weight / volume",
      type: "text",
      placeholder: "e.g. 50ml, 100g",
    },
    { key: "shade", label: "Shade / colour", type: "text", placeholder: "e.g. Rose Pink" },
    { key: "ingredients", label: "Ingredients", type: "textarea" },
  ],
  Chocolate: [
    { key: "net_weight", label: "Net weight", type: "text", placeholder: "e.g. 100g" },
    { key: "flavor", label: "Flavor", type: "text", placeholder: "e.g. Hazelnut" },
    { key: "contains_nuts", label: "Contains nuts", type: "checkbox" },
    { key: "ingredients", label: "Ingredients", type: "textarea" },
  ],
  "Fancy Items": [
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Brass, Glass" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 10 x 5 x 3 cm" },
    { key: "color", label: "Color", type: "text" },
  ],
  "Household Items": [
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Plastic, Steel" },
    {
      key: "dimensions",
      label: "Dimensions / size",
      type: "text",
      placeholder: "e.g. 30 x 20 cm",
    },
    {
      key: "power_rating",
      label: "Power rating",
      type: "text",
      placeholder: "Leave blank if non-electrical",
    },
  ],
};

export type ProductAttributes = Record<string, string | boolean | string[]>;

export function parseAttributesFromFormData(
  category: string,
  formData: FormData
): ProductAttributes {
  if (!isProductCategory(category)) return {};

  const attributes: ProductAttributes = {};
  for (const field of CATEGORY_FIELDS[category]) {
    const name = `attr_${field.key}`;
    if (field.type === "checkbox") {
      attributes[field.key] = formData.get(name) === "on";
    } else if (field.type === "multiselect") {
      const values = formData.getAll(name).map(String);
      if (values.length > 0) attributes[field.key] = values;
    } else {
      const value = String(formData.get(name) ?? "").trim();
      if (value) attributes[field.key] = value;
    }
  }
  return attributes;
}
