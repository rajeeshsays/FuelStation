
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Gauge,
  Truck,
  Warehouse,
  BarChart3,
  History,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/meter-readings", icon: Gauge, label: "Meter Readings" },
  { href: "/stock", icon: Truck, label: "Stock Management" },
  { href: "/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/audit-log", icon: History, label: "Audit Log" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// SettingsNav with logout has been removed.
export function SettingsNav() {
    return null;
}
