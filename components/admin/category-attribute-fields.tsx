"use client";

import { useState } from "react";
import {
  CATEGORY_FIELDS,
  PRODUCT_CATEGORIES,
  isProductCategory,
  type ProductCategory,
} from "@/lib/category-fields";

const inputClass =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value) return [value];
  return [];
}

export function CategoryAttributeFields({
  defaultCategory,
  defaultAttributes,
}: {
  defaultCategory?: string | null;
  defaultAttributes?: Record<string, unknown>;
}) {
  const [category, setCategory] = useState<ProductCategory | "">(
    isProductCategory(defaultCategory) ? defaultCategory : ""
  );

  const fields = category ? CATEGORY_FIELDS[category] : [];

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          className={inputClass}
        >
          <option value="" disabled>
            Select a category
          </option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {fields.length > 0 && (
        <div className="flex flex-col gap-4 rounded-lg border border-dashed border-black/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {category} details
          </p>
          {fields.map((field) => {
            const defaultValue = defaultAttributes?.[field.key];
            const name = `attr_${field.key}`;

            if (field.type === "checkbox") {
              return (
                <label key={field.key} className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name={name} defaultChecked={Boolean(defaultValue)} />
                  {field.label}
                </label>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium">{field.label}</label>
                  <textarea
                    name={name}
                    rows={3}
                    defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              );
            }

            if (field.type === "multiselect") {
              const selected = toStringArray(defaultValue);
              return (
                <div key={field.key}>
                  <label className="mb-1.5 block text-sm font-medium">{field.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-light/40 has-[:checked]:text-brand-dark"
                      >
                        <input
                          type="checkbox"
                          name={name}
                          value={opt}
                          defaultChecked={selected.includes(opt)}
                          className="sr-only"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium">{field.label}</label>
                  <select
                    name={name}
                    defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium">{field.label}</label>
                <input
                  type={field.type === "date" ? "date" : "text"}
                  name={name}
                  defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
