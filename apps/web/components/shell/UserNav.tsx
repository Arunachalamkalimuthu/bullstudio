"use client";

import Link from "next/link";
import { useSession, signOut } from "@bullstudio/auth/react";
import { LogOut, ChevronsUpDown, CreditCard } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@bullstudio/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@bullstudio/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@bullstudio/ui/components/sidebar";
import { Skeleton } from "@bullstudio/ui/components/skeleton";
import { useParams } from "next/navigation";

export function UserNav() {
  const { data: session, status } = useSession();
  const { isMobile, state } = useSidebar();
  const { organizationSlug: orgSlug } = useParams();
  const isCollapsed = state === "collapsed";

  if (status === "loading") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <Skeleton className="size-8 rounded-lg" />
            {!isCollapsed && (
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-32" />
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = getInitials(user.name || user.email || "U");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={
                isCollapsed ? user.name || user.email || "User" : undefined
              }
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name || "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.name || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/${orgSlug}/billing`}>
                <CreditCard className="mr-2 size-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (!first) return "U";
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const firstChar = first.charAt(0);
  const lastChar = last?.charAt(0) ?? "";
  return (firstChar + lastChar).toUpperCase();
}
