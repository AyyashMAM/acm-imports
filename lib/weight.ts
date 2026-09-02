// Admin enters weight as separate kg and g parts (e.g. "2 kg 600 g" for a
// 2.6kg product) rather than one decimal-kg field, since most of the
// catalog is easier to weigh/enter that way. Stored and used downstream
// (courier fee calc, DB) as plain kg — conversion happens at the form
// boundary only.
export function toKg(kgPart: number, gPart: number): number {
  const kg = Number.isFinite(kgPart) ? kgPart : NaN;
  const g = Number.isFinite(gPart) ? gPart : NaN;
  return kg + g / 1000;
}

// For pre-filling the edit form.
export function fromKg(weightKg: number): { kg: number; g: number } {
  const totalGrams = Math.round(weightKg * 1000);
  return { kg: Math.floor(totalGrams / 1000), g: totalGrams % 1000 };
}
