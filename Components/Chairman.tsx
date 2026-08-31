import { Quote } from "lucide-react";
import Image from "next/image";

export default function Chairman() {
  return (
    <section id="management" className="bg-white py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -left-5 -top-5 h-full w-full border-4 border-[#BD9872]" />

          <div className="relative h-[520px] overflow-hidden bg-neutral-200">
            <Image
              src="/ch.png"
              alt="Chairman of Ajdal"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-8 right-0 bg-[#0F4545] px-8 py-6 text-white">
            <p className="text-lg font-semibold uppercase text-[#BD9872]">
              Chairman
            </p>

            <p className="mt-1 text-sm text-neutral-200">
              Optimized Holding
            </p>
          </div>
        </div>

        <div>
          <Quote size={52} className="text-[#BD9872]" />

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
            Chairman&apos;s Message
          </p>

          <h2 className="mt-3 text-4xl font-semibold uppercase leading-tight text-[#0F4545] md:text-5xl">
            Building Trust Through Quality and Commitment
          </h2>

          <p className="mt-7 text-lg leading-9 text-neutral-600">
           “Qatar’s unprecedented development during the last decade has motivated businessmen and entrepreneurs to
            pursue their business ambitions. Driven by the National Vision 2030, the country has transformed into a field of investment opportunities in multiple sectors.
             The Government has been committed to encouraging independence from hydrocarbon resources by seeking greater participation and partnership from the private sector to diversify and develop the country’s economy. 
             These factors, along with my passion for business, inspired by being involved in the family business alongside my father from a young age, 
             encouraged me to establish Optimized Holding—a company offering innovative products and services that cater to the evolving and increasingly sophisticated needs of the market.”
          </p>


          <div className="mt-9 border-l-4 border-[#BD9872] pl-6">
            <p className="text-xl font-semibold uppercase text-[#0F4545]">
              H.E. Sheikh Mohamed Bin Faisal Al-Thani
            </p>

            <p className="mt-1 text-sm uppercase tracking-wide text-neutral-500">
              Chairman, Optimized Holding
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}