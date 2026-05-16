"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { slideUp as slideUpVariant } from "@/lib/motion/slide";
import { CommandPalette } from "@/components/ui/command-palette";
import { useState } from "react";
import { ArrowRight, Bot, Database, Sparkles, Workflow } from "lucide-react";

export function HeroSection() {
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sage-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-700/20 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center max-w-5xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={slideUpVariant}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-white/5 backdrop-blur-sm text-sm text-sage-300">
            <Sparkles className="w-4 h-4" />
            <span>SynapseCRM Platform Phase 1</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight text-white leading-tight">
            Autonomous AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-300 to-slate-400">
              Revenue Intelligence
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-400">
            An intelligent operating system for revenue teams. Multi-agent orchestration, persistent memory, and conversational workflows out of the box.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full w-full sm:w-auto" onClick={() => setCmdOpen(true)}>
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto">
              Book a Demo
            </Button>
          </div>
        </motion.div>

        {/* Animated Dashboard Preview & Orchestration Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mt-20 mx-auto w-full max-w-4xl"
        >
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl">
            {/* Window header */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            
            {/* Orchestration visualization */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/50 rounded-xl p-8 border border-white/5">
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-glass-sm">
                  <Database className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-xs font-medium text-slate-400">Lead</span>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-600 animate-pulse hidden md:block" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sage-500/20 flex items-center justify-center border border-sage-500/30 shadow-glow">
                  <Bot className="w-6 h-6 text-sage-400" />
                </div>
                <span className="text-xs font-medium text-sage-400">AI Analysis</span>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-600 animate-pulse hidden md:block" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-glass-sm">
                  <Workflow className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-xs font-medium text-slate-400">Memory</span>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-600 animate-pulse hidden md:block" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-glass-sm">
                  <Sparkles className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-xs font-medium text-slate-400">Recommendation</span>
              </div>

            </div>

            {/* Floating Metrics */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-12 top-1/4 hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/90 p-4 shadow-glass backdrop-blur-md"
            >
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Win Rate</span>
                <span className="text-lg font-semibold text-sage-400">+24%</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-8 bottom-1/4 hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/90 p-4 shadow-glass backdrop-blur-md"
            >
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Agent Status</span>
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-success" /> Active
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </section>
  );
}
