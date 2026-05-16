import { useInView as useFramerInView, UseInViewOptions } from "framer-motion";
import { useRef } from "react";

export function useInView<T extends HTMLElement = HTMLDivElement>(options: UseInViewOptions = { once: true, margin: "-100px" as any }) {
  const ref = useRef<T>(null);
  const isInView = useFramerInView(ref, options);
  
  return { ref, isInView };
}
