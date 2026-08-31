"use client";

import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { FormEvent, useState } from "react";

const contactDetails = [
  {
    icon: Phone,
    title: "Phone",
    value: "+974 3020 1116",
    href: "tel:+97430201116",
    external: false,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+974 3020 1116",
    href: "https://wa.me/97430201116",
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    value: "ahmad.aljabri@optimizedautomotive.com.qa",
    href: "mailto:ahmad.aljabri@optimizedautomotive.com.qa",
    external: false,
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Block 2, 5 E Industrial St, Doha, Qatar",
    href: "https://maps.app.goo.gl/mLQMWKSyPG91ZFh97?g_st=ic",
    external: true,
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSending(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      service: formData.get("service"),
      vehicleMake: formData.get("vehicleMake"),
      vehicleModel: formData.get("vehicleModel"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to send your request."
        );
      }

      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);

      setError(
        "We couldn't send your request. Please try again or contact us directly."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        <div className="grid overflow-hidden shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT SIDE */}

          <div className="bg-[#082F2F] p-8 text-white md:p-12 lg:p-14">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
              Contact Ajdal
            </p>

            <h2 className="mt-4 text-4xl font-semibold uppercase leading-tight md:text-5xl">
              Let Us Restore Your Vehicle
            </h2>

            <p className="mt-6 leading-8 text-neutral-300">
              Contact our team to request an inspection, receive a quotation
              or learn more about our automotive painting services.
            </p>

            <div className="mt-10 space-y-6">

              {contactDetails.map((detail) => {
                const Icon = detail.icon;

                return (
                  <a
                    key={detail.title}
                    href={detail.href}
                    target={detail.external ? "_blank" : undefined}
                    rel={detail.external ? "noreferrer" : undefined}
                    className="group flex items-center gap-4"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#BD9872] text-[#0F4545]">
                      <Icon size={21} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        {detail.title}
                      </p>

                      <p className="mt-1 text-sm font-medium text-white transition group-hover:text-[#BD9872]">
                        {detail.value}
                      </p>

                    </div>

                  </a>
                );
              })}

            </div>

            <div className="mt-10 border-t border-white/10 pt-8">

              <div className="flex gap-4">

                <Clock3
                  size={24}
                  className="shrink-0 text-[#BD9872]"
                />

                <div>

                  <p className="font-semibold uppercase">
                    Working Hours
                  </p>

                  <p className="mt-2 text-sm leading-7 text-neutral-300">
                    Saturday – Thursday
                    <br />
                    8:00 AM – 6:00 PM
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="bg-[#F5F0EA] p-8 md:p-12 lg:p-14">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#BD9872]">
              Request a Quote
            </p>

            <h3 className="mt-3 text-3xl font-semibold uppercase text-[#0F4545] md:text-4xl">
              Tell Us About Your Vehicle
            </h3>

            {submitted ? (

              <div className="mt-10 border-l-4 border-[#0F4545] bg-white p-6 shadow-sm">

                <div className="flex items-start gap-4">

                  <CheckCircle2
                    size={26}
                    className="shrink-0 text-[#0F4545]"
                  />

                  <div>

                    <h4 className="text-lg font-semibold text-[#0F4545]">
                      Request received
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      Thank you for contacting Ajdal. Your request has
                      been sent successfully. Our team will contact you
                      as soon as possible.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setError("");
                      }}
                      className="mt-5 text-sm font-semibold uppercase tracking-wide text-[#BD9872]"
                    >
                      Send another request
                    </button>

                  </div>

                </div>

              </div>

            ) : (

              <form
                onSubmit={handleSubmit}
                className="mt-9 space-y-5"
              >

                {/* Name + Phone */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    required
                    className="h-14 w-full border border-neutral-300 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-500 focus:border-[#0F4545]"
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    required
                    className="h-14 w-full border border-neutral-300 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-500 focus:border-[#0F4545]"
                  />

                </div>

                {/* Email + Service */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    className="h-14 w-full border border-neutral-300 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-500 focus:border-[#0F4545]"
                  />

                  <select
                    name="service"
                    required
                    defaultValue=""
                    className="h-14 w-full border border-neutral-300 bg-white px-5 text-sm text-neutral-600 outline-none transition focus:border-[#0F4545]"
                  >

                    <option value="" disabled>
                      Select service
                    </option>

                    <option value="Custom Full Vehicle Painting">
                      Custom Full Vehicle Painting
                    </option>

                    <option value="Vehicle Restoration">
                      Vehicle Restoration
                    </option>

                    <option value="Paintless Dent Repair (PDR)">
                      Paintless Dent Repair (PDR)
                    </option>

                    <option value="Peelable Paint Solutions">
                      Peelable Paint Solutions
                    </option>

                    <option value="Wheel Painting & Refinishing">
                      Wheel Painting & Refinishing
                    </option>

                  </select>

                </div>

                {/* Vehicle */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <input
                    type="text"
                    name="vehicleMake"
                    placeholder="Vehicle make"
                    className="h-14 w-full border border-neutral-300 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-500 focus:border-[#0F4545]"
                  />

                  <input
                    type="text"
                    name="vehicleModel"
                    placeholder="Vehicle model"
                    className="h-14 w-full border border-neutral-300 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-500 focus:border-[#0F4545]"
                  />

                </div>

                {/* Message */}

                <textarea
                  name="message"
                  placeholder="Describe the required work"
                  rows={6}
                  required
                  className="w-full resize-none border border-neutral-300 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-neutral-500 focus:border-[#0F4545]"
                />

                {/* Error */}

                {error && (
                  <div className="border-l-4 border-red-500 bg-white px-5 py-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-3 bg-[#0F4545] px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#BD9872] hover:text-[#0F4545] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Request"}

                  {!sending && <Send size={18} />}
                </button>

              </form>

            )}

          </div>

        </div>

      </div>
    </section>
  );
}