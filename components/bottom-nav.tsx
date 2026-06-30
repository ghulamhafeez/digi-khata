"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Receipt, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/",            label: "Home",         icon: Home           },
  { href: "/customers",   label: "Customers",    icon: Users          },
  { href: "/transactions",label: "Transactions", icon: Receipt        },
  { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard},
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/60 md:hidden"
    >
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          // Mark active for exact "/" and prefix-match for sub-routes
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-xs font-medium transition-colors
                ${isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-500 active:text-blue-600"
                }`}
            >
              <Icon
                className={`h-5 w-5 transition-all ${isActive ? "stroke-[2.5px]" : ""}`}
                aria-hidden="true"
              />
              <span>{label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
