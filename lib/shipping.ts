// Courier pricing: Rs 425 for the first kg, then Rs 100 per additional kg,
// rounded up (any part of a kg is billed as a full kg) — applied once to the
// combined weight of every item in the order, not per line item.
const FIRST_KG_RATE = 425;
const FIRST_KG_LIMIT = 1;
const ADDITIONAL_KG_RATE = 100;

export function calculateShippingFee(totalWeightKg: number): number {
  if (!Number.isFinite(totalWeightKg) || totalWeightKg <= 0) return 0;
  if (totalWeightKg <= FIRST_KG_LIMIT) return FIRST_KG_RATE;

  const extraKg = Math.ceil(totalWeightKg - FIRST_KG_LIMIT);
  return FIRST_KG_RATE + extraKg * ADDITIONAL_KG_RATE;
}
