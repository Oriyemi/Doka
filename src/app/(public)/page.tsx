"use client";

import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SplashScreen finishloading={() => setIsLoading(false)} />;
  }

  return (
    <main className="min-h-dvh bg-canvas p-6">
      <p>Landing page coming next</p>
    </main>
  );
}