"use client";

import { cn } from "@bullstudio/ui/lib/utils";
import { useSidebar } from "@bullstudio/ui/components/sidebar";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed: collapsedProp }: LogoProps) {
  const sidebar = useSidebarSafe();
  const isCollapsed = collapsedProp ?? sidebar?.state === "collapsed";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Bull icon - minimalist geometric bull head */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox="0 0 32 32"
          className="size-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main bull head shape */}
          <path
            d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C21.523 26 26 21.523 26 16C26 10.477 21.523 6 16 6Z"
            className="fill-primary"
          />
          {/* Left horn */}
          <path
            d="M8 8L4 3L7 7L8 8Z"
            className="fill-primary"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6.5 9.5C5.5 7 4 4.5 3 3"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Right horn */}
          <path
            d="M25.5 9.5C26.5 7 28 4.5 29 3"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Nose ring */}
          <circle
            cx="16"
            cy="20"
            r="3"
            className="stroke-primary-foreground"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Eyes */}
          <circle cx="12" cy="14" r="1.5" className="fill-primary-foreground" />
          <circle cx="20" cy="14" r="1.5" className="fill-primary-foreground" />
        </svg>
      </div>

      {/* Text logo */}
      <div
        className={cn(
          "flex flex-col transition-all duration-200",
          isCollapsed && "opacity-0 w-0 overflow-hidden"
        )}
      >
        <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
          bullstudio
        </span>
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
          Queue Manager
        </span>
      </div>
    </div>
  );
}

// Safe hook that doesn't throw if used outside SidebarProvider
function useSidebarSafe() {
  try {
    // This is a workaround since we can't conditionally call hooks
    // We use the exported useSidebar but catch the error
    const context = useSidebar();
    return context;
  } catch {
    return null;
  }
}
