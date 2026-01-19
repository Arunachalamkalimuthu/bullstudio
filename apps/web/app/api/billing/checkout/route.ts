// src/app/checkout/route.ts
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: "http://localhost:3000/confirmation?checkout_id={CHECKOUT_ID}",
  server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
});
