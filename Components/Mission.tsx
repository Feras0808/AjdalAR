import {
  BadgeCheck,
  Eye,
  Gauge,
  HeartHandshake,
  Shield,
  Target,
} from "lucide-react";

const values = [
  {
    icon: BadgeCheck,
    title: "Quality",
    description:
      "We uphold the highest professional standards throughout every stage of the refinishing and restoration process.",
  },
  {
    icon: Shield,
    title: "Reliability",
    description:
      "We earn our customers’ trust through transparency, accountability, and consistently dependable service.",
  },
  {
    icon: Gauge,
    title: "Precision",
    description:
      "From surface preparation and color matching to paint application and final finishing, precision is at the heart of everything we do.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Commitment",
    description:
      "Customer satisfaction guides every decision we make and every vehicle we deliver.",
  },
];

export default function Mission() {
  return (
    <section
      id="mission"
      className="relative overflow-hidden bg-[#082F2F] py-24 text-white lg:py-32"
    >
      <div className="absolute -right-48 top-0 h-[600px] w-[600px] rounded-full bg-[#BD9872]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-[#BD9872]/50 md:p-12">
            <div className="flex h-16 w-16 items-center justify-center bg-[#BD9872] text-[#0F4545]">
              <Target size={31} />
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
              Our Mission
            </p>

            <h2 className="mt-3 text-4xl font-semibold uppercase md:text-5xl">
                Professional Excellence in Every Detail            </h2>

            <p className="mt-6 leading-8 text-neutral-300">
Our mission is to provide reliable automotive painting and restoration services that combine technical expertise, premium materials, and exceptional customer care. We are committed to delivering superior workmanship and results that exceed expectations.            </p>
          </article>

          <article className="border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-[#BD9872]/50 md:p-12">
            <div className="flex h-16 w-16 items-center justify-center bg-white text-[#0F4545]">
              <Eye size={31} />
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
              Our Vision
            </p>

            <h2 className="mt-3 text-4xl font-semibold uppercase md:text-5xl">
              A Trusted Leader in Automotive Refinishing
            </h2>

            <p className="mt-6 leading-8 text-neutral-300">
              Our vision is to become the preferred name in automotive painting and restoration, recognized for exceptional quality, operational excellence, and long-term customer trust.
            </p>
          </article>
        </div>

        <div className="mt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
              Our Core Values
            </p>

            <h2 className="mt-3 text-4xl font-semibold uppercase md:text-5xl">
              The Principles That Drive Our Success
            </h2>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="bg-[#082F2F] p-8 transition hover:bg-[#0F4545]"
                >
                  <Icon size={34} className="text-[#BD9872]" />

                  <h3 className="mt-6 text-xl font-semibold uppercase">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-neutral-300">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}