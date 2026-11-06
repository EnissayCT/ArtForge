/** Order model and statuses, shared by the order API and the admin. */

export interface OrderItem {
  kind: "plate" | "case";
  title: string;
  label?: string;
  artSlug?: string;
  designId?: string;
  size?: string;
  finish?: string;
  frame?: string;
  landscape?: boolean;
  phone?: string;
  caseType?: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  number: string;
  status: OrderStatus;
  createdAt: string;
  payment: "COD";
  source?: string;
  customer: {
    name: string;
    phone: string;
    city: string;
    otherCity?: string;
    address: string;
    email?: string;
    notes?: string;
  };
  items: OrderItem[];
  promo?: string;
  totals: { subtotal: number; discount: number; promo: number; shipping: number; total: number; count?: number };
  /** private note, admin only */
  note?: string;
  history?: { at: string; status?: OrderStatus; message?: string }[];
}

export const ORDER_STATUSES = [
  { id: "nouvelle", label: "Nouvelle", hint: "Pas encore contactée", tone: "bg-ember text-white" },
  { id: "contactee", label: "Contactée", hint: "Message envoyé, en attente de réponse", tone: "bg-brass/25 text-ink" },
  { id: "attente", label: "Liste d'attente", hint: "Client prévenu : production à venir", tone: "bg-ink/10 text-ink" },
  { id: "confirmee", label: "Confirmée", hint: "Le client a confirmé", tone: "bg-ok/15 text-ok" },
  { id: "expediee", label: "Expédiée", hint: "Remise au livreur", tone: "bg-ink text-paper" },
  { id: "livree", label: "Livrée", hint: "Payée et livrée", tone: "bg-ok text-white" },
  { id: "annulee", label: "Annulée", hint: "Annulée ou injoignable", tone: "bg-stone/20 text-stone line-through" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["id"];

export function statusInfo(id: string) {
  return ORDER_STATUSES.find((s) => s.id === id) ?? ORDER_STATUSES[0];
}

export function orderCity(o: Order) {
  return o.customer.city === "Autre ville" ? o.customer.otherCity || "Autre ville" : o.customer.city;
}

/** Fills a WhatsApp template: {prenom} {nom} {numero} {total} {articles} {ville} {marque} */
export function fillTemplate(template: string, o: Order, brand: string, formatDH: (n: number) => string) {
  const first = o.customer.name.trim().split(/\s+/)[0] ?? "";
  const articles = o.items.map((i) => `• ${i.qty}× ${i.title}${i.label ? ` (${i.label})` : ""}`).join("\n");
  const vars: Record<string, string> = {
    prenom: first,
    nom: o.customer.name.trim(),
    numero: o.number,
    total: formatDH(o.totals.total),
    articles,
    ville: orderCity(o),
    marque: brand,
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
