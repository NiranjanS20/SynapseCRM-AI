"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { reveal } from "@/lib/motion/viewport";
import { Brain, Network, Zap, Shield, Database, Workflow } from "lucide-react";

const features = [
  {
    title: "Multi-Agent AI",
    desc: "Deploy autonomous agents that negotiate, qualify leads, and close deals in parallel.",
    icon: Network,
    span: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    title: "Persistent Memory",
    desc: "Infinite context window tracking every interaction.",
    icon: Database,
    span: "col-span-1 md:col-span-1",
  },
  {
    title: "Conversational Intelligence",
    desc: "Natural language reasoning engine.",
    icon: Brain,
    span: "col-span-1 md:col-span-1",
  },
  {
    title: "Autonomous Workflows",
    desc: "Self-healing, self-improving operational pipelines.",
    icon: Workflow,
    span: "col-span-1 md:col-span-2",
  },
];

export function BentoFeatures() {
  const { ref, isInView } = useInView();

  return (
    <section id="features" className="py-24 relative z-10 bg-slate-950">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          ref={ref}
          initial="initial"
          animate={isInView ? "whileInView" : "initial"}
          variants={reveal}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Intelligence. Not just data.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A unified ecosystem of specialized AI agents working together to drive revenue.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30 p-8 shadow-glass backdrop-blur-md group ${feat.span}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <Icon className="w-8 h-8 text-sage-400 mb-6" />
                <h3 className="font-display text-xl font-medium text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
