"use client";

import { useState, useEffect, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CSSScene } from "@/components/CSSScene";
import { MobileView } from "@/components/mobile/MobileView";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  if (isMobile) return <MobileView />;

  return (
    <>
      {!ready && <LoadingScreen onReady={handleReady} />}
      {ready && <CSSScene />}
    </>
  );
}
