"use client";

import { useEffect, useRef } from "react";
import { createTimeline } from "animejs";

interface SplashScreenProps {
  finishLoading: () => void;
}

const SplashScreen = ({ finishLoading }: SplashScreenProps) => {
  const logoRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  // Keep the latest callback without restarting the animation on re-renders
  const finishRef = useRef(finishLoading);
  useEffect(() => {
    finishRef.current = finishLoading;
  }, [finishLoading]);

  useEffect(() => {
    if (!logoRef.current || !taglineRef.current) return;

    const timeline = createTimeline({
      onComplete: () => finishRef.current(),
    });

    timeline
      .set(logoRef.current, { scale: 0, opacity: 0 })
      .set(taglineRef.current, { opacity: 0, translateY: 12 })
      .add(logoRef.current, {
        scale: 1.2,
        opacity: 1,
        duration: 700,
        ease: "outBack",
      })
      .add(logoRef.current, { scale: 1, duration: 400, ease: "inOutQuad" })
      .add(taglineRef.current, {
        opacity: 1,
        translateY: 0,
        duration: 500,
        ease: "outQuad",
      })
      .add(logoRef.current, { scale: 1.08, duration: 350, ease: "outQuad" })
      .add(logoRef.current, { scale: 1, duration: 300, ease: "inOutQuad" });

    return () => {
      timeline.pause(); // stop the animation if the component unmounts early
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex h-dvh flex-col items-center justify-center overflow-hidden bg-[#701E47]">
      {/* Decorative circle from the design */}
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#8C2B5C] md:h-[28rem] md:w-[28rem]" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <h1
          ref={logoRef}
          className="text-6xl font-extrabold tracking-tight text-white opacity-0 sm:text-7xl md:text-8xl"
        >
          Doka<span className="text-white/60">.</span>
        </h1>
        <p
          ref={taglineRef}
          className="mt-3 text-sm text-white/70 opacity-0 sm:text-base md:mt-4 md:text-xl"
        >
          Every service. One market.
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;