"use client";

import { Button } from "@/components/ui/button";

import { CameraIcon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2">
          <CameraIcon className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold tracking-tight">
            Cekrek!
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="#features">Features</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#gallery">Gallery</a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
