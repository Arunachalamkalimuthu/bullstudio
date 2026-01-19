import { NextRequest, NextResponse } from "next/server";
import { polar } from "@bullstudio/billing";
import { prisma } from "@bullstudio/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const checkoutId = searchParams.get("checkout_id");

  if (!checkoutId) {
    return NextResponse.json(
      { error: "Checkout ID is required" },
      { status: 400 }
    );
  }

  try {
    const checkout = await polar.checkouts.get({ id: checkoutId });

    if (!checkout) {
      return NextResponse.json(
        { error: "Checkout not found" },
        { status: 404 }
      );
    }

    if (checkout.status !== "succeeded") {
      return NextResponse.json(
        { error: "Checkout was not successful" },
        { status: 400 }
      );
    }

    // Get the organization from the customer ID
    const customerId = checkout.customerId;
    if (!customerId) {
      return NextResponse.json(
        { error: "No customer associated with checkout" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findFirst({
      where: { polarCustomerId: customerId },
      select: { slug: true },
    });

    return NextResponse.json({
      success: true,
      productName: checkout.product?.name ?? "Subscription",
      orgSlug: org?.slug ?? null,
    });
  } catch (error) {
    console.error("[verify-checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify checkout" },
      { status: 500 }
    );
  }
}
