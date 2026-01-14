import { cn } from "@bullstudio/ui/lib/utils";

export const MaxWidthWrapper = ({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
};
