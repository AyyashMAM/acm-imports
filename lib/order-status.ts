export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// The "pending" DB value predates this feature and is kept as-is for
// backward compatibility with existing rows/code; only the display label
// changes to reflect that it now means "awaiting admin confirmation".
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-zinc-200 text-zinc-600",
};

// The happy-path progression shown in customer-facing timelines. Cancelled
// is handled separately wherever this is used (it's a terminal state, not a
// step on this line).
export const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];
