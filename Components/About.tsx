import { Award, ShieldCheck, SprayCan, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: SprayCan,
    title: "Advanced Equipment",
    description:
      "State-of-the-art spray booths and professional-grade equipment ensure a clean, controlled environment for consistent, high-quality results.",
  },
  {
    icon: ShieldCheck,
    title: "Premium Materials",
    description:
      "We use carefully selected automotive paint systems and materials known for their durability, superior finish, and long-lasting protection.",
  },
  {
    icon: Users,
    title: "Experienced Team",
    description:
      "Our highly skilled technicians bring extensive experience in automotive painting, refinishing, and body restoration.",
  },
  {
    icon: Award,
    title: "Attention to Detail",
    description:
      "Every vehicle undergoes a comprehensive inspection to ensure it meets our exact standards before being returned to its owner.",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-white py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-10">
        <div className="relative">
          <div className="group relative h-[500px] overflow-hidden md:h-[620px]">
            <Image
              src="/Ajdal.png"
              alt="Ajdal automotive painting workshop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-[#0F4545]/10 transition-opacity duration-700 group-hover:opacity-0" />
          </div>

          <div className="absolute -bottom-8 -right-2 z-10 bg-[#0F4545] px-8 py-7 text-white shadow-xl md:-right-8">
            <p className="text-5xl font-semibold text-[#BD9872]">10+</p>

            <p className="mt-2 max-w-[150px] text-sm uppercase leading-5 tracking-wider">
              Years of Automotive Experience
            </p>
          </div>

          <div className="absolute -left-4 top-12 z-10 h-40 w-4 bg-[#BD9872] md:-left-6" />
        </div>

        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
            About Ajdal
          </p>

          <h2 className="text-4xl font-semibold uppercase leading-tight text-[#0F4545] md:text-5xl lg:text-6xl">
            Automotive Excellence Through Precision
          </h2>

          <p className="mt-7 text-base leading-8 text-neutral-600">
            At Ajdal, we specialize in professional automotive painting and body repair services designed to restore and enhance the appearance of every vehicle. Combining expert craftsmanship with advanced equipment and industry-leading techniques, we deliver exceptional results that meet the highest standards of quality.
          </p>

          <p className="mt-4 text-base leading-8 text-neutral-600">
           Whether it's a complete vehicle repaint, paint correction, scratch repair, or body restoration, every project is handled with careful preparation, precise color matching, and rigorous quality control to ensure a flawless finish.
          </p>

          <div className="mt-10 grid gap-7 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group flex gap-4 rounded-sm p-2 transition duration-300 hover:bg-[#F5F0EA]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#F5F0EA] text-[#0F4545] transition duration-300 group-hover:bg-[#0F4545] group-hover:text-[#BD9872]">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold uppercase text-[#0F4545]">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="#services"
            className="mt-10 inline-flex bg-[#0F4545] px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white transition duration-300 hover:bg-[#BD9872] hover:text-[#0F4545]"
          >
            Discover Our Services
          </Link>
        </div>
      </div>
    </section>
  );
}