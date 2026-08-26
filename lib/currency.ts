// All prices in the database are stored as plain numeric LKR amounts (no currency
// column), so this is the single place that decides how they're displayed.
export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
