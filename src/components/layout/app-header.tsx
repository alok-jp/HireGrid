"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NAV = {
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/invitations", label: "Invite Team" },
  ],
  recruiter: [
    { href: "/recruiter", label: "Dashboard" },
    { href: "/recruiter/job-openings", label: "Job Openings" },
    { href: "/recruiter/job-openings/archived", label: "Archived" },
  ],
  interviewer: [
    { href: "/interviewer", label: "My Applications" },
  ],
};

export function AppHeader({
  role,
  user,
}: {
  role: "admin" | "recruiter" | "interviewer";
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = NAV[role] || [];

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <span className="text-title text-[var(--text-primary)]">
          {role === "admin" ? "Admin Portal" : "Hiring Pipeline"}
        </span>

        <nav className="flex items-center gap-6">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  active ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-[19px] h-[2px] bg-[var(--accent)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 rounded-sm hover:bg-[var(--surface-2)] transition-colors cursor-pointer outline-none">
          <span className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-semibold">
            {initial}
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline-block">
            {user.name || user.email}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <div className="px-3 py-2">
            <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {user.name || "User"}
            </div>
            <div className="text-xs text-[var(--text-secondary)] truncate">
              {user.email}
            </div>
            <div className="text-micro mt-1 uppercase font-bold text-[var(--accent)] tracking-wider">
              {user.role}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSignOut} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
