"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Why Choose Us", href: "#why-choose-us" },
  { name: "About", href: "#about" },
];

export function GlassNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 mx-auto mt-4 max-w-5xl px-4 transition-all duration-300 ease-out",
        scrolled ? "mt-2 max-w-4xl" : "mt-4"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-full border border-white/10 bg-slate-900/40 px-6 py-3 shadow-glass backdrop-blur-xl transition-all duration-300",
          scrolled && "bg-slate-900/60 shadow-2xl backdrop-blur-2xl py-2"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-sage-400 to-sage-600" />
          <span className="font-display text-lg font-semibold text-white tracking-tight">SynapseCRM</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
