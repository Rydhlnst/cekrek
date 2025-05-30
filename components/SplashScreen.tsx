"use client";

import { CameraIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const iconRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Bounce animasi untuk icon
    gsap.fromTo(
      iconRef.current,
      { y: -20 },
      {
        y: 0,
        duration: 0.6,
        ease: "bounce.out",
        repeat: 2,
        yoyo: true,
        delay: 0.2,
      }
    );

    // Delay sebelum mulai fade-out
    const fadeOutDelay = 2000;

    const fadeTimeout = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          setShowSplash(false);
        },
      });
    }, fadeOutDelay);

    return () => clearTimeout(fadeTimeout);
  }, []);

  if (showSplash) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white transition-opacity"
      >
        <div
          ref={iconRef}
          className="text-3xl flex flex-row font-bold items-center space-x-3"
        >
          <CameraIcon className="w-12 h-12" />
          <span className="hidden md:block">Cekrek!</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
