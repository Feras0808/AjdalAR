import { Quote } from "lucide-react";
import Image from "next/image";

export default function Gm() {
  return (
    <section className="bg-[#F5F0EA] py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">

        {/* GM Image */}
        <div className="relative order-1 mx-auto w-full max-w-md lg:order-2">
          <div className="absolute -bottom-5 -right-5 h-full w-full bg-[#BD9872]" />

          <div className="relative h-[520px] overflow-hidden bg-neutral-200">
            <Image
              src="/gm1.png"
              alt="Group General Manager of Optimized Holding"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* Same style as Chairman */}
          <div className="absolute -bottom-8 right-0 bg-[#0F4545] px-8 py-6 text-white">
            <p className="text-lg font-semibold uppercase text-[#BD9872]">
              Group General Manager
            </p>

            <p className="mt-1 text-sm text-neutral-200">
              Optimized Holding
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="order-2 lg:order-1">
          <Quote size={52} className="text-[#BD9872]" />

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
            Group General Manager&apos;s Message
          </p>

          <h2 className="mt-3 text-4xl font-semibold uppercase leading-tight text-[#0F4545] md:text-5xl">
            Delivering Reliable Results on Every Vehicle
          </h2>

          <p className="mt-7 text-lg leading-9 text-neutral-600">
            “At Optimized Holding, we are driven by a commitment not only to
            meet but to exceed the highest standards of excellence, reflecting
            the values of Qatar’s dynamic business landscape. Embracing the
            spirit of Qatar’s National Vision 2030 for a diversified and
            innovative economy, we continuously push the boundaries of what is
            possible. Through a culture of perseverance, collaboration,
            creativity, and cutting-edge innovation, we aim to create lasting
            value for our stakeholders and contribute significantly to the
            growth of Qatar’s key industries.”
          </p>

          {/* Signature */}
          <div className="mt-9 border-l-4 border-[#BD9872] pl-6">
            <p className="text-xl font-semibold uppercase text-[#0F4545]">
              Mr. Reda Salem
            </p>

            <p className="mt-1 text-sm uppercase tracking-wide text-neutral-500">
              Group General Manager, Optimized Holding
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}