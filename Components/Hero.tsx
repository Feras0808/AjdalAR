import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const features = [
  "Expert Color Matching",
  "Premium Paint Systems",
  "Skilled Automotive Technicians",
  "Quality-Assured Finishing",
];

const statistics = [
  {
    value: "10+",
    label: "Years of Experience",
  },
  {
    value: "1,000+",
    label: "Vehicles Completed",
  },
  {
    value: "100%",
    label: "Quality Commitment",
  },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/hero.png')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#061f1f]/95 via-[#0F4545]/75 to-[#0F4545]/10" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 lg:px-10 lg:pb-40">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center border-l-4 border-[#BD9872] bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm sm:text-sm">
            Your Car Deserves Perfection
          </div>

          <h1 className="text-5xl font-semibold uppercase leading-[1.05] text-white sm:text-6xl lg:text-8xl">
            Flawless Finish
            <span className="block text-[#BD9872]">Uncompromising Quality</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-200 md:text-lg">
          Professional automotive painting, body repair, and refinishing solutions delivered with precision, advanced technology, and meticulous attention to detail.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-sm font-medium text-white"
              >
                <CheckCircle2
                  size={19}
                  className="shrink-0 text-[#BD9872]"
                />

                {feature}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#contact"
              className="group flex items-center gap-3 bg-[#BD9872] px-7 py-4 text-sm font-semibold uppercase tracking-wide text-[#0F4545] transition hover:bg-white"
            >
              Request a Quote

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="#services"
              className="border border-white px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#0F4545]"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 hidden w-full lg:block">
        <div className="mx-auto grid max-w-7xl grid-cols-3 bg-white shadow-2xl">
          {statistics.map((statistic, index) => (
            <div
              key={statistic.label}
              className={`px-8 py-7 ${
                index !== statistics.length - 1
                  ? "border-r border-neutral-200"
                  : ""
              }`}
            >
              <p className="text-3xl font-semibold text-[#0F4545]">
                {statistic.value}
              </p>

              <p className="mt-1 text-sm uppercase tracking-wide text-neutral-500">
                {statistic.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}