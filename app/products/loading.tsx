export default function ProductsLoading() {
  return (
    <div>
      <div className="border-b border-black/10 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <div className="mx-auto h-9 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="mx-auto mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-zinc-200" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-8">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-zinc-100" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden border border-black/10 bg-white">
              <div className="aspect-square w-full animate-pulse bg-zinc-100" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
