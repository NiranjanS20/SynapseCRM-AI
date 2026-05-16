"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion/stagger";
import { ReactNode } from "react";

interface WidgetConfig {
  id: string;
  component: React.FC;
  span?: string;
}

interface WidgetEngineProps {
  widgets: WidgetConfig[];
}

export function WidgetEngine({ widgets }: WidgetEngineProps) {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {widgets.map((widget) => {
        const Component = widget.component;
        return (
          <motion.div key={widget.id} variants={staggerItem} className={widget.span}>
            <Component />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
