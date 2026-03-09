"use client";

import { useState } from "react";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Truck,
  Banknote,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Nador",
  "Mohammedia",
  "El Jadida",
  "Beni Mellal",
  "Khouribga",
  "Settat",
  "Safi",
  "Taza",
  "Khemisset",
  "Berkane",
  "Errachidia",
  "Larache",
  "Guelmim",
  "Essaouira",
];

interface FormErrors {
  [key: string]: string | undefined;
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shippingFree = subtotal >= 500;
  const shipping = shippingFree ? 0 : 30;
  const total = subtotal + shipping;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Nom complet requis";
    if (!form.phone.trim()) {
      newErrors.phone = "Numéro de téléphone requis";
    } else if (!/^(0[5-7]\d{8}|\+212[5-7]\d{8})$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Numéro marocain invalide (ex: 0612345678)";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email invalide";
    }
    if (!form.city) newErrors.city = "Ville requise";
    if (!form.address.trim()) newErrors.address = "Adresse requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            city: form.city,
            address: form.address.trim(),
            notes: form.notes.trim() || null,
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantLabel: item.variantLabel,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            previewUrl: item.previewUrl,
          })),
          subtotal,
          shipping,
          total,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la commande");
      }

      const data = await res.json();
      setOrderId(data.orderId || "AF-" + Date.now().toString(36).toUpperCase());
      setOrderPlaced(true);
      clearCart();
    } catch {
      setErrors({ _form: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  // Empty cart redirect
  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Panier vide</h1>
          <p className="text-muted-foreground mb-6">
            Ajoutez des produits avant de passer commande.
          </p>
          <Link href="/customize">
            <Button variant="accent" size="lg">
              Créer un produit
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Order success
  if (orderPlaced) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-muted-foreground mb-2">
            Merci pour votre commande. Vous paierez à la livraison.
          </p>
          {orderId && (
            <p className="text-sm font-mono bg-secondary px-3 py-1.5 rounded-lg inline-block mb-6">
              Référence : {orderId}
            </p>
          )}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nous vous contacterons au{" "}
              <span className="font-medium text-foreground">{form.phone}</span>{" "}
              pour confirmer votre commande.
            </p>
            <Link href="/">
              <Button variant="accent">Retour à l&apos;accueil</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/cart"
        className="flex items-center gap-1 text-sm text-accent hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au panier
      </Link>

      <h1 className="text-3xl font-bold mb-8">Passer commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="border border-border rounded-xl p-6 bg-card space-y-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-accent" />
              Informations de livraison
            </h2>

            {errors._form && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                {errors._form}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Nom complet *
                </label>
                <Input
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Ahmed Bennani"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Téléphone *
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0612345678"
                  type="tel"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Email <span className="text-muted-foreground">(optionnel)</span>
              </label>
              <Input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="ahmed@email.com"
                type="email"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Ville *
              </label>
              <Select
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={errors.city ? "border-destructive" : ""}
              >
                <option value="">Sélectionner une ville</option>
                {MOROCCAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
              {errors.city && (
                <p className="text-xs text-destructive mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Adresse complète *
              </label>
              <Textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Numéro, rue, quartier, code postal..."
                rows={3}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-xs text-destructive mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Notes{" "}
                <span className="text-muted-foreground">(optionnel)</span>
              </label>
              <Textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Instructions spéciales pour la livraison..."
                rows={2}
              />
            </div>
          </div>

          {/* Payment info */}
          <div className="border border-border rounded-xl p-6 bg-card">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-3">
              <Banknote className="h-5 w-5 text-accent" />
              Mode de paiement
            </h2>
            <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <Banknote className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium">Paiement à la livraison (COD)</p>
                <p className="text-sm text-muted-foreground">
                  Payez en espèces à la réception de votre colis.
                </p>
              </div>
              <Badge variant="accent" className="ml-auto">
                Seule option
              </Badge>
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="xl"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Confirmer la commande — {formatPrice(total)}
              </>
            )}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-xl p-6 bg-card sticky top-20">
            <h2 className="font-bold text-lg mb-4">Votre commande</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.variantLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className={shippingFree ? "text-green-600" : ""}>
                  {shippingFree ? "Gratuite" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
                <span>Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
