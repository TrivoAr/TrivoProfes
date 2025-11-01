"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { NavItem } from "@/lib/types";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  PartyPopper,
  Users,
  School,
  UserCheck,
  CreditCard,
  LogOut,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/notification-center";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/outings", label: "Salidas Sociales", icon: PartyPopper },
  { href: "/teams", label: "Equipos", icon: Users },
  { href: "/academies", label: "Academias", icon: School },
  { href: "/members", label: "Miembros", icon: UserCheck },
  { href: "/payments", label: "Configuraciones", icon: Settings },
];

const bottomNavItems: NavItem[] = [];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);

  // Filtrar items de navegación según el rol del usuario
  // Usamos useEffect para evitar hydration errors
  useEffect(() => {
    if (status === "loading") return;

    const filtered = navItems.filter(item => {
      const userRole = session?.user?.rol;

      // Para profesores y dueños de academia: dashboard, salidas y academias
      if (userRole === "profe" || userRole === "dueñoAcademia") {
        return item.href === "/dashboard" || item.href === "/outings" || item.href === "/academies";
      }

      // Para admins: todo
      if (userRole === "admin") {
        return true;
      }

      return false;
    });

    setFilteredNavItems(filtered);
  }, [session, status]);

  const getPageTitle = () => {
    const currentItem = filteredNavItems.find(item => pathname.startsWith(item.href));
    return currentItem ? currentItem.label : "Panel Principal";
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">T</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Trivo Admin</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
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
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {bottomNavItems.map((item) => (
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
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                    <LogOut />
                    <span>Cerrar Sesión</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center gap-3 border-t border-sidebar-border p-3">
            <Avatar className="h-10 w-10">
                {session?.user?.imagen ? (
                  <Image
                    src={session.user.imagen}
                    alt={session?.user?.firstname || "Admin"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    loading="lazy"
                    quality={75}
                  />
                ) : (
                  <AvatarFallback>{session?.user?.firstname?.[0] || "A"}{session?.user?.lastname?.[0] || "D"}</AvatarFallback>
                )}
            </Avatar>
            <div className="flex flex-col">
                <span className="font-semibold text-sm text-sidebar-foreground">
                  {session?.user?.firstname} {session?.user?.lastname}
                </span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/80 px-3 sm:px-4 backdrop-blur-sm">
           <SidebarTrigger className="md:hidden" />
           <div className="flex w-full items-center justify-between min-w-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold truncate">{getPageTitle()}</h2>
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <NotificationCenter />
            </div>
           </div>
        </header>
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
