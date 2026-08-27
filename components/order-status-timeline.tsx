import { STATUS_LABELS, STATUS_STEPS, STATUS_STYLES, type OrderStatus } from "@/lib/order-status";

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${STATUS_STYLES.cancelled}`}>
        {STATUS_LABELS.cancelled}
      </span>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <ol className="flex flex-wrap gap-3">
      {STATUS_STEPS.map((step, i) => (
        <li
          key={step}
          className={`rounded-full px-3 py-1.5 text-sm font-bold ${
            i <= currentStep ? STATUS_STYLES[step] : "bg-zinc-100 text-zinc-400"
          }`}
        >
          {STATUS_LABELS[step]}
        </li>
      ))}
    </ol>
  );
}
