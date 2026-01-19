import { Suspense } from "react";
import { ConfirmationContent } from "./ConfirmationContent";

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="animate-pulse text-zinc-400">Loading...</div>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
