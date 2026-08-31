import {
  Car,
  CircleDot,
  PaintBucket,
  Paintbrush,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ArPaintVisualizer from "./ArPaintVisualizer";

const services = [
  {
    title: "Custom Full Vehicle Painting",
    description:
      "Transform your vehicle with premium custom paint solutions tailored to your vision.",
    image: "/DSC08725.JPG",
    icon: PaintBucket,
  },
  {
    title: "Vehicle Restoration",
    description:
      "Restore your vehicle's original beauty with expert refinishing and repair services.",
    image: "/ajdal1.png",
    icon: Car,
  },
  {
    title: "Paintless Dent Repair (PDR)",
    description:
      "Efficient dent removal techniques that preserve the vehicle's original paintwork.",
    image: "/pdr.png",
    icon: ShieldCheck,
  },
  {
    title: "Peelable Paint Solutions",
    description:
      "Flexible and removable paint coatings that offer protection and customization options.",
    image: "/ajdal7.png",
    icon: Paintbrush,
  },
  {
    title: "Wheel Painting & Refinishing",
    description:
      "Enhance the appearance of your wheels with professional painting and finishing services.",
    image: "/ajdal2.png",
    icon: CircleDot,
  },
];

export default function Services() {
  const [arTitle, setArTitle] = useState<string | null>(null);

  return (
    <section id="services" className="bg-[#F5F0EA] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
            What We Do
          </p>

          <h2 className="text-4xl font-semibold uppercase text-[#0F4545] md:text-5xl lg:text-6xl">
            Our Automotive Services
          </h2>

          <p className="mt-6 leading-8 text-neutral-600">
            Complete painting and vehicle appearance solutions delivered with
            professional workmanship and attention to detail.
          </p>
        </div>

        {/* Services */}
        <div className="mx-auto mt-14 max-w-[900px] space-y-7">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image Section */}
                <div className="relative h-[360px]">

                  {/* Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 900px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#082F2F]/80 via-transparent to-transparent" />
                  </div>

                  {/* Service Icon */}
                  <div
                    className="
                      absolute
                      bottom-0
                      left-6
                      z-20
                      flex
                      h-16
                      w-16
                      translate-y-1/2
                      items-center
                      justify-center
                      bg-[#BD9872]
                      text-[#0F4545]
                      shadow-lg
                      transition-all
                      duration-300
                      group-hover:bg-[#0F4545]
                      group-hover:text-[#BD9872]
                    "
                  >
                    <Icon
                      size={30}
                      strokeWidth={2.2}
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-7 pb-9 pt-12">
                  <div className="mb-3 flex items-start justify-between gap-6">

                    {/* Title */}
                    <h3 className="text-2xl font-semibold uppercase leading-tight text-[#0F4545] md:text-3xl">
                      {service.title}
                    </h3>

                    {/* Number */}
                    <span className="shrink-0 pt-1 text-sm font-bold text-[#BD9872]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="leading-7 text-neutral-600">
                    {service.description}
                  </p>

                  {(service.title === "Custom Full Vehicle Painting" ||
                    service.title === "Peelable Paint Solutions") && (
                    <button
                      type="button"
                      onClick={() => setArTitle(service.title)}
                      className="mt-6 inline-flex min-h-12 items-center justify-center border border-[#0F4545] bg-[#0F4545] px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-[#082F2F]"
                    >
                      Try Your Car in AR
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {arTitle && (
        <ArPaintVisualizer title={arTitle} onClose={() => setArTitle(null)} />
      )}
    </section>
  );
}