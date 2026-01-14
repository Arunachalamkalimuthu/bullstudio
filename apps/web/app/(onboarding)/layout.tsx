import { MaxWidthWrapper } from "@/components/shell/MaxWidthWrapper";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaxWidthWrapper className="flex min-h-screen justify-center flex-col w-full items-center py-12">
      {children}
    </MaxWidthWrapper>
  );
}
