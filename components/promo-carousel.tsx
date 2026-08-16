import Link from "next/link";
import { Carousel } from "@/components/carousel";

const SLIDES = [
  {
    eyebrow: "New this week",
    title: "Fresh imports just landed",
    text: "Browse the latest additions to our catalog before they sell out.",
    cta: "Shop new arrivals",
    href: "/products",
    bgClassName: "from-orange-50 via-amber-50 to-white",
  },
  {
    eyebrow: "Cash on delivery",
    title: "Pay when it arrives",
    text: "Order online with confidence — no online payment required.",
    cta: "Start shopping",
    href: "/products",
    bgClassName: "from-zinc-100 via-zinc-50 to-white",
  },
  {
    eyebrow: "Nationwide shipping",
    title: "Fast delivery, every order",
    text: "Quick, reliable shipping to every corner of the country.",
    cta: "See what's available",
    href: "/products",
    bgClassName: "from-rose-50 via-orange-50 to-white",
  },
];

export function PromoCarousel() {
  return (
    <Carousel autoPlayMs={5000} theme="light" className="rounded-3xl">
      {SLIDES.map((slide) => (
        <div
          key={slide.title}
          className={`relative flex min-h-[260px] flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br px-6 py-16 text-center sm:min-h-[320px] ${slide.bgClassName}`}
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand/5 blur-3xl" />

          <span className="relative rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-dark">
            {slide.eyebrow}
          </span>
          <h2 className="relative text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            {slide.title}
          </h2>
          <p className="relative max-w-md text-zinc-600">{slide.text}</p>
          <Link
            href={slide.href}
            className="relative mt-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-zinc-800"
          >
            {slide.cta}
          </Link>
        </div>
      ))}
    </Carousel>
  );
}
