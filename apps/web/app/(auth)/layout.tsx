import { MaxWidthWrapper } from "@/components/shell/MaxWidthWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaxWidthWrapper className="flex min-h-screen justify-center flex-col w-full items-center">
      {children}
    </MaxWidthWrapper>
  );
}
