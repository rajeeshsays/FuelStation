
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
  PersonStanding,
  FuelIcon,
  Funnel,
  Timer,
  CircleDivide,
  ListOrderedIcon,
  Repeat1Icon
} from "lucide-react";
import Nozzle from "@/models/Nozzle";
import { FunnelChart } from "recharts";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/meter-readings", icon: Gauge, label: "Meter Readings" },
  { href: "/stock", icon: Truck, label: "Stock Management" },
  { href: "/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/audit-log", icon: History, label: "Audit Log" },
  { href: "/staff", icon: PersonStanding, label: "Staff" },
  { href: "/pump", icon:FuelIcon, label: "Pump" },
  { href: "/nozzle", icon:Funnel, label: "Nozzle" },
  { href: "/shift", icon:Repeat1Icon, label: "Shift" },
  { href: "/assignShift", icon:ListOrderedIcon, label: "Assign Shift" },
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
