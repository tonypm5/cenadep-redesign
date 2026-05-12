import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useFadeUp(selector = ".reveal", deps = []) {
  const ctxRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });
    });
    ctxRef.current = ctx;
    return () => ctx.revert();
    // eslint-disable-next-line
  }, deps);
}

export function animateCounter(node, target, duration = 2.5) {
  const obj = { v: 0 };
  return gsap.to(obj, {
    v: target,
    duration,
    ease: "expo.out",
    onUpdate: () => {
      node.textContent = Math.floor(obj.v).toLocaleString();
    },
  });
}

export { gsap, ScrollTrigger };
