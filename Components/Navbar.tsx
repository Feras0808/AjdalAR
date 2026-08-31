"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Mission & Vision", href: "#mission" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md"
          : "border-b border-black/5 bg-white/95 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="#home"
          onClick={() => setMenuOpen(false)}
          className="relative z-50 flex h-16 w-20 items-center justify-start"
        >
          <Image
            src="/AjdalLogo.png"
            alt="Ajdal Auto Painting"
            width={498}
            height={501}
            priority
            className="h-14 w-14 object-contain"
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm font-semibold uppercase tracking-wide text-[#172626] transition duration-300 after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-[#BD9872] after:transition-all after:duration-300 hover:text-[#0F4545] hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="#contact"
            className="bg-[#0F4545] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#BD9872] hover:text-[#0F4545]"
          >
            Get a Quote
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="relative z-50 flex h-11 w-11 items-center justify-center text-[#0F4545] lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div
          className={`fixed inset-0 z-40 flex min-h-screen flex-col items-center justify-center gap-7 bg-white px-6 transition-all duration-300 lg:hidden ${
            menuOpen
              ? "visible translate-x-0 opacity-100"
              : "invisible translate-x-full opacity-0"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl font-semibold uppercase tracking-wide text-[#172626] transition hover:text-[#BD9872]"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-3 bg-[#0F4545] px-8 py-4 font-semibold uppercase tracking-wide text-white"
          >
            Get a Quote
          </Link>
        </div>
      </nav>
    </header>
  );
}