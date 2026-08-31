import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  FaInstagram,
} from "react-icons/fa6";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Mission & Vision", href: "#mission" },
  { label: "Contact", href: "#contact" },
];

const services = [
  "Custom Full Vehicle Painting",
  "Vehicle Restoration",
  "Paintless Dent Repair (PDR)",
  "Peelable Paint Solutions",
  "Wheel Painting & Refinishing",
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/ajdal.qatar?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==",
    icon: FaInstagram,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#061F1F] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <Image
            src="/AjdalLogo.png"
            alt="Ajdal Auto Painting"
            width={140}
            height={100}
            className="h-auto w-[120px] rounded-sm bg-white object-contain p-2"
          />

          <p className="mt-6 text-sm leading-7 text-neutral-300">
            Professional automotive painting, body repair and vehicle finishing
            services delivered with precision and care.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center border border-white/20 text-white transition hover:border-[#BD9872] hover:bg-[#BD9872] hover:text-[#0F4545]"
                >
                  <Icon size={17} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold uppercase">Quick Links</h3>

          <div className="mt-3 h-[3px] w-12 bg-[#BD9872]" />

          <ul className="mt-6 space-y-3">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="inline-block text-sm text-neutral-300 transition hover:translate-x-1 hover:text-[#BD9872]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold uppercase">Our Services</h3>

          <div className="mt-3 h-[3px] w-12 bg-[#BD9872]" />

          <ul className="mt-6 space-y-3">
            {services.map((service) => (
              <li key={service} className="text-sm text-neutral-300">
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold uppercase">Contact</h3>

          <div className="mt-3 h-[3px] w-12 bg-[#BD9872]" />

          <div className="mt-6 space-y-5">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 text-sm text-neutral-300 transition hover:text-[#BD9872]"
            >
              <MapPin size={19} className="shrink-0 text-[#BD9872]" />
              Doha, Qatar
            </a>

            <a
              href="tel:+97400000000"
              className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-[#BD9872]"
            >
              <Phone size={19} className="shrink-0 text-[#BD9872]" />
              +974 3020 1116
            </a>

            <a
              href="mailto:info@ajdal.com"
              className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-[#BD9872]"
            >
              <Mail size={19} className="shrink-0 text-[#BD9872]" />
              ahmad.aljabri@optimizedautomotive.com.qa
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center text-xs text-neutral-400 sm:flex-row lg:px-10">
          <p>
            © {new Date().getFullYear()} Ajdal Auto Painting. All rights
            reserved.
          </p>

         <p>
  A Company Owned By{" "}
  <a
    href="https://www.optimizedholding.com.qa"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#BD9872] hover:underline"
  >
    Optimized Holding
  </a>
</p>
        </div>
      </div>
    </footer>
  );
}