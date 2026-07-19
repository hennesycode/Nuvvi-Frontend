import { motion, useReducedMotion } from "framer-motion";

export function HeroDashboardPreview() {
  const prefersReduced = useReducedMotion();

  const Wrapper = prefersReduced ? "div" : motion.div;

  return (
    <Wrapper
      {...(prefersReduced ? {} : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      })}
      className="relative w-full max-w-[540px] mx-auto"
    >
      <img
        src="/header-nuvvi.png"
        alt="Nuvvi Dashboard"
        className="w-full h-auto"
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,1) 100%)",
        }}
        aria-hidden="true"
      />
    </Wrapper>
  );
}
