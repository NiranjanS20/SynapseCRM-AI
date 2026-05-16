"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { reveal } from "@/lib/motion/viewport";

const sections = [
  {
    title: "Explainable AI",
    desc: "Every recommendation is backed by a transparent reasoning graph. Understand exactly why an agent took action, ensuring enterprise trust.",
  },
  {
    title: "Orchestration over Automation",
    desc: "We don't just automate repetitive tasks. Our platform orchestrates complex, multi-step cognitive workflows that adapt to unexpected roadblocks.",
  },
  {
    title: "Persistent Enterprise Memory",
    desc: "Agents remember every email, meeting, and slack message, allowing them to context-switch flawlessly between deals.",
  }
];

export function WhyChooseUs() {
  const { ref, isInView } = useInView();

  return (
    <section id="why-choose-us" className="py-24 bg-slate-950 border-t border-white/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          ref={ref}
          initial="initial"
          animate={isInView ? "whileInView" : "initial"}
          variants={reveal}
          className="mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white">
            Built for enterprise scale.
          </h2>
        </motion.div>

        <div className="space-y-16">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row gap-8 items-center ${idx % 2 === 0 ? "" : "md:flex-row-reverse"}`}
            >
              <div className="flex-1 space-y-4">
                <h3 className="font-display text-2xl font-medium text-white">{section.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{section.desc}</p>
              </div>
              <div className="flex-1 w-full aspect-video rounded-2xl border border-white/5 bg-slate-900/50 p-4 shadow-glass overflow-hidden flex items-center justify-center">
                {/* Placeholder for complex visual or UI mockup */}
                <div className="text-slate-600 text-sm font-medium">Visual Representation</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
