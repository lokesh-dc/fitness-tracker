"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, User, Dumbbell, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  // Don't show navigation on auth pages
  if (pathname.startsWith("/auth")) return null;

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Home" },
    { href: "/plan", icon: CalendarRange, label: "Plan" },
    { href: "/analytics", icon: BarChart2, label: "Stats" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-foreground/10 flex justify-around items-center px-6 md:hidden z-50">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "flex flex-col items-center transition-colors",
              pathname === item.href ? "text-orange-500" : "text-foreground/40 hover:text-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar Navigation (Desktop Only) */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 glass border-r border-foreground/10 hidden md:flex flex-col items-center py-8 space-y-8 z-50">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] mb-8">
          <Dumbbell className="w-6 h-6 text-black" />
        </div>
        
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "p-3 rounded-2xl transition-all",
              pathname === item.href 
                ? "text-orange-500 bg-foreground/5" 
                : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
      </nav>
    </>
  );
}
