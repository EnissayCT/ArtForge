"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/pricing";

interface Order {
  orderId: string;
  status: string;
  customer: { fullName: string; city: string };
  total: number;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const stats = [
    {
      label: "Commandes",
      value: orders.length.toString(),
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Revenus",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "En attente",
      value: pendingOrders.toString(),
      icon: ShoppingBag,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Articles vendus",
      value: totalItems.toString(),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">
          Vue d&apos;ensemble de votre boutique ArtForge
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="border border-border rounded-xl p-4 bg-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="border border-border rounded-xl bg-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold">Commandes récentes</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune commande pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">Réf</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {order.customer.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.customer.city}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    PENDING: { label: "En attente", classes: "bg-amber-500/10 text-amber-600" },
    CONFIRMED: { label: "Confirmé", classes: "bg-blue-500/10 text-blue-600" },
    PROCESSING: { label: "En cours", classes: "bg-purple-500/10 text-purple-600" },
    SHIPPED: { label: "Expédié", classes: "bg-indigo-500/10 text-indigo-600" },
    DELIVERED: { label: "Livré", classes: "bg-green-500/10 text-green-600" },
    CANCELLED: { label: "Annulé", classes: "bg-red-500/10 text-red-600" },
  };

  const c = config[status] || { label: status, classes: "bg-secondary text-foreground" };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.classes}`}>
      {c.label}
    </span>
  );
}
