import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (replace with Prisma/Supabase in production)
const orders: Record<string, unknown>[] = [];

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "AF-";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { customer, items, subtotal, shipping, total } = body;

    // Basic validation
    if (!customer?.fullName || !customer?.phone || !customer?.city || !customer?.address) {
      return NextResponse.json(
        { error: "Informations client incomplètes" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }

    // Phone validation
    const cleanPhone = customer.phone.replace(/\s/g, "");
    if (!/^(0[5-7]\d{8}|\+212[5-7]\d{8})$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Numéro de téléphone invalide" },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();

    const order = {
      orderId,
      status: "PENDING",
      customer: {
        fullName: customer.fullName,
        phone: cleanPhone,
        email: customer.email || null,
        city: customer.city,
        address: customer.address,
        notes: customer.notes || null,
      },
      items: items.map((item: {
        productId: string;
        variantId: string;
        productName: string;
        variantLabel: string;
        unitPrice: number;
        quantity: number;
        previewUrl?: string;
      }) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantLabel: item.variantLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        previewUrl: item.previewUrl || null,
      })),
      subtotal,
      shipping,
      total,
      paymentMethod: "COD",
      createdAt: new Date().toISOString(),
    };

    // Store in memory (in production, save to database)
    orders.push(order);

    console.log(`[Order Created] ${orderId}`, JSON.stringify(order, null, 2));

    return NextResponse.json({ orderId, status: "PENDING" }, { status: 201 });
  } catch (error) {
    console.error("[Orders API Error]", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all orders (admin usage, no auth for now)
  return NextResponse.json({ orders, count: orders.length });
}
