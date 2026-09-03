export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-zinc-100" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-11 w-full animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
