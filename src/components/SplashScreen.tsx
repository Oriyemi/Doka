"use client";

import { useEffect } from "react";
import { createTimeline } from "animejs";

interface SplashScreenProps {
  finishloading: () => void;
}

const SplashScreen = ({ finishloading }: SplashScreenProps) => {
  useEffect(() => {
    const loader = createTimeline({
      onComplete: () => finishloading(),
    });

    loader
      .set("#logo", { scale: 0, opacity: 0 })
      .add("#logo", {
        scale: 1.2,
        opacity: 1,
        duration: 700,
        ease: "outBack",
      })
      .add("#logo", {
        scale: 1,
        duration: 400,
        ease: "inOutQuad",
      })
      .add("#logo", {
        scale: 1.1,
        duration: 400,
        ease: "outQuad",
      })
      .add("#logo", {
        scale: 1,
        duration: 300,
        ease: "inOutQuad",
      });

    return () => {
      loader.pause(); // if this component is removed before the animation finishes, stop it
    };
  }, [finishloading]);

  return (
    <div className="flex h-dvh items-center justify-center bg-primary">
      <h1
        id="logo"
        className="text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl"
        style={{ opacity: 0 }}
      >
        Doka
      </h1>
    </div>
  );
};

export default SplashScreen;