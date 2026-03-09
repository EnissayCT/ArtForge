"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OrderItem {
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

interface Order {
  orderId: string;
  status: string;
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
    city: string;
    address: string;
    notes: string | null;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
}

const STATUSES = [
  { value: "", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmé" },
  { value: "PROCESSING", label: "En cours" },
  { value: "SHIPPED", label: "Expédié" },
  { value: "DELIVERED", label: "Livré" },
  { value: "CANCELLED", label: "Annulé" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600",
  CONFIRMED: "bg-blue-500/10 text-blue-600",
  PROCESSING: "bg-purple-500/10 text-purple-600",
  SHIPPED: "bg-indigo-500/10 text-indigo-600",
  DELIVERED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-red-500/10 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos commandes et suivez les livraisons
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par réf, client, téléphone..."
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} commande{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Orders list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Chargement des commandes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {orders.length === 0
            ? "Aucune commande pour le moment."
            : "Aucune commande ne correspond à vos filtres."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order.orderId}
              className="border border-border rounded-xl bg-card overflow-hidden"
            >
              {/* Order header - clickable */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === order.orderId ? null : order.orderId
                  )
                }
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium">
                      {order.orderId}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        STATUS_COLORS[order.status] || "bg-secondary"
                      }`}
                    >
                      {STATUSES.find((s) => s.value === order.status)?.label ||
                        order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{order.customer.fullName}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.customer.city}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-accent">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-MA")}
                  </p>
                </div>
                {expandedId === order.orderId ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded details */}
              {expandedId === order.orderId && (
                <div className="border-t border-border p-4 bg-secondary/10 space-y-4">
                  {/* Customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="text-accent hover:underline"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                    {order.customer.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">@</span>
                        <span>{order.customer.email}</span>
                      </div>
                    )}
                    <div className="sm:col-span-2 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>
                        {order.customer.address}, {order.customer.city}
                      </span>
                    </div>
                    {order.customer.notes && (
                      <div className="sm:col-span-2 p-2 bg-amber-500/10 text-amber-700 rounded text-xs">
                        Note : {order.customer.notes}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Articles</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2 border border-border"
                        >
                          <div>
                            <span className="font-medium">
                              {item.productName}
                            </span>
                            <span className="text-muted-foreground ml-1.5">
                              {item.variantLabel}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground">
                              ×{item.quantity}
                            </span>{" "}
                            <span className="font-medium">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end text-sm space-x-6">
                    <div className="space-y-1 text-right">
                      <div className="text-muted-foreground">
                        Sous-total: {formatPrice(order.subtotal)}
                      </div>
                      <div className="text-muted-foreground">
                        Livraison:{" "}
                        {order.shipping === 0
                          ? "Gratuite"
                          : formatPrice(order.shipping)}
                      </div>
                      <div className="font-bold text-accent text-base">
                        Total: {formatPrice(order.total)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
