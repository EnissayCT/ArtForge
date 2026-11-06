import type { Metadata } from "next";
import { ThankYou } from "@/components/cart/ThankYou";

export const metadata: Metadata = { title: "Merci pour votre commande", robots: { index: false } };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return <ThankYou number={n ?? ""} />;
}
