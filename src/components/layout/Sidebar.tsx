"use client";

import { FolderKanban, LogOut, SquareCheckBig, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { SidebarProjects } from "./SidebarProjects";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [{ href: "/projects", label: "Projects", icon: FolderKanban }];

export function Brand() {
  return (
    <Link
      href="/projects"
      className="flex items-center gap-2 rounded-md text-base font-semibold text-text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-background">
        <SquareCheckBig className="size-5" aria-hidden="true" />
      </span>
      Task Manager
    </Link>
  );
}

interface SidebarProps {
  /** Called after a nav link is chosen (closes the mobile drawer). */
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            // Individual projects are highlighted in the list below instead.
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    active
                      ? "bg-primary-light text-primary-dark"
                      : "text-text-primary hover:bg-background-secondary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </Link>
                {href === "/projects" && <SidebarProjects onNavigate={onNavigate} />}
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
              <p className="truncate text-xs text-text-secondary">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-1 w-full justify-start px-3" onClick={logout}>
            <LogOut className="size-5" aria-hidden="true" />
            Log out
          </Button>
        </div>
      )}
    </div>
  );
}
