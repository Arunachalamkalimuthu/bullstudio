// src/polar.ts
import { Polar } from "@polar-sh/sdk";
import { BILLING_ENABLED } from "./const";

let polar: Polar | null = null;

export const getPolarClient = () => {
  if (polar) return polar;

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken || !BILLING_ENABLED()) {
    return null;
  }
  polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
  });
  return polar;
};
