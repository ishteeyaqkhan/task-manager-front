"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Brand, Sidebar } from "./Sidebar";

/** Mobile-only top bar with a slide-in navigation drawer (hidden on md+). */
export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer || !drawerOpen) return;

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!drawer.open) drawer.showModal();

    // Close if the viewport grows past the mobile breakpoint while open.
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false);
    };
    desktop.addEventListener("change", onChange);

    return () => {
      desktop.removeEventListener("change", onChange);
      if (drawer.open) drawer.close();
      trigger?.focus();
    };
  }, [drawerOpen]);

  const close = () => setDrawerOpen(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <Brand />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation"
        aria-expanded={drawerOpen}
        aria-controls="mobile-nav"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <dialog
        id="mobile-nav"
        ref={drawerRef}
        aria-label="Navigation"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-dvh w-72 max-w-[85vw] border-r border-border bg-background p-0 shadow-lg backdrop:bg-text-primary/40"
      >
        {drawerOpen && (
          <div className="relative h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Close navigation"
              className="absolute top-3 right-3 z-10"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
            <Sidebar onNavigate={close} />
          </div>
        )}
      </dialog>
    </header>
  );
}
