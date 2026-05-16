export const viewportConfig = {
  once: true,
  margin: "-100px"
}

export const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
  viewport: viewportConfig
}
