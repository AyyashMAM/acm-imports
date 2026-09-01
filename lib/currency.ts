// All prices in the database are stored as plain numeric LKR amounts (no currency
// column), so this is the single place that decides how they're displayed.
export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type Margin = { amount: number; percent: number };

// Shared by the admin variant editor (live, per keystroke) and the products
// list (server-rendered) so the two views can never disagree on the math.
export function computeMargin(price: number, costPrice: number | null): Margin | null {
  if (costPrice == null || !Number.isFinite(price) || price <= 0) return null;
  const amount = price - costPrice;
  return { amount, percent: (amount / price) * 100 };
}
