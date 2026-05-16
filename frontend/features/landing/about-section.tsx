"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { reveal } from "@/lib/motion/viewport";

export function AboutSection() {
  const { ref, isInView } = useInView();

  return (
    <section id="about" className="py-32 relative bg-slate-950 overflow-hidden border-t border-white/5">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
        <motion.div
          ref={ref}
          initial="initial"
          animate={isInView ? "whileInView" : "initial"}
          variants={reveal}
          className="space-y-8"
        >
          <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
            The future of business operations is autonomous.
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
            We are building the intelligence layer for revenue teams. SynapseCRM replaces disjointed tools with a unified brain that learns your business, automates complex workflows, and proactively uncovers revenue opportunities.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
