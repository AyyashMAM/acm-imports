import { formatPrice } from "@/lib/currency";

// Dependency-free SVG bar chart: keeps the admin bundle small instead of
// pulling in a charting library for a single 30-bar view.
export function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  const width = 700;
  const height = 180;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const gap = 3;
  const barWidth = data.length > 0 ? width / data.length - gap : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-40 w-full"
      role="img"
      aria-label="Daily revenue for the last 30 days"
    >
      {data.map((d, i) => {
        const barHeight = Math.max(1, (d.revenue / max) * (height - 8));
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <rect
            key={d.date}
            x={x}
            y={y}
            width={Math.max(0, barWidth)}
            height={barHeight}
            rx={2}
            className={d.revenue > 0 ? "fill-brand" : "fill-zinc-200"}
          >
            <title>
              {new Date(d.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              {": "}
              {formatPrice(d.revenue)}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}
