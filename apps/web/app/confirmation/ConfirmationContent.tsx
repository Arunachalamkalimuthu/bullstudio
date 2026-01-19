"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@bullstudio/ui/components/button";

type ConfirmationState = {
  status: "loading" | "success" | "error";
  message?: string;
  productName?: string;
  orgSlug?: string;
};

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutId = searchParams.get("checkout_id");

  const [state, setState] = useState<ConfirmationState>({
    status: "loading",
  });

  useEffect(() => {
    if (!checkoutId) {
      setState({
        status: "error",
        message: "No checkout ID provided",
      });
      return;
    }

    const verifyCheckout = async () => {
      try {
        const response = await fetch(
          `/api/billing/verify-checkout?checkout_id=${checkoutId}`
        );
        const data = await response.json();

        if (!response.ok) {
          setState({
            status: "error",
            message: data.error || "Failed to verify checkout",
          });
          return;
        }

        setState({
          status: "success",
          productName: data.productName,
          orgSlug: data.orgSlug,
        });

        // Auto-redirect after 3 seconds
        if (data.orgSlug) {
          setTimeout(() => {
            router.push(`/${data.orgSlug}/billing`);
          }, 3000);
        }
      } catch (error) {
        setState({
          status: "error",
          message: "An error occurred while verifying your subscription",
        });
      }
    };

    verifyCheckout();
  }, [checkoutId, router]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Loader2 className="size-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            Verifying your subscription...
          </h1>
          <p className="text-zinc-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="size-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-zinc-500 mb-6">{state.message}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-24 bg-green-500/20 rounded-full animate-ping" />
          </div>
          <CheckCircle2 className="size-20 text-green-500 mx-auto relative" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          Subscription Activated!
        </h1>
        <p className="text-zinc-400 mb-2">
          Welcome to <span className="text-zinc-100 font-medium">{state.productName}</span>
        </p>
        <p className="text-zinc-500 text-sm mb-6">
          Your subscription is now active. You have access to all the features
          included in your plan.
        </p>
        <div className="space-y-3">
          {state.orgSlug && (
            <Button
              onClick={() => router.push(`/${state.orgSlug}/billing`)}
              className="w-full"
            >
              Go to Billing
            </Button>
          )}
          <p className="text-xs text-zinc-600">
            You will be redirected automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
