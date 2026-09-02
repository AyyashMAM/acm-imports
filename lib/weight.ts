// Admin enters weight as a value + unit (kg or g) for convenience — e.g. a
// 250g product doesn't have to be typed as "0.25" — but everything is
// stored and used downstream (courier fee calc, DB) as plain kg.
export type WeightUnit = "kg" | "g";

export function isWeightUnit(value: unknown): value is WeightUnit {
  return value === "kg" || value === "g";
}

export function toKg(value: number, unit: WeightUnit): number {
  return unit === "g" ? value / 1000 : value;
}

// For pre-filling the edit form: show sub-kilogram weights in grams so
// "0.25" doesn't have to be mentally converted back by whoever's editing it.
export function fromKg(weightKg: number): { value: number; unit: WeightUnit } {
  if (weightKg > 0 && weightKg < 1) {
    return { value: Math.round(weightKg * 1000), unit: "g" };
  }
  return { value: weightKg, unit: "kg" };
}
