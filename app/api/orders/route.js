import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { hasPermission, isStaff } from "@/lib/permissions";

function generateOrderCode() {
  const part = () => nanoid(4).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  return `KS-${part()}-${part()}`;
}

// GET: lista ordini (solo staff). POST pubblico già esistente la lasciamo
// per il checkout; qui gestiamo anche la creazione manuale da admin.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaff(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  // Ordine manuale creato da Admin/Owner (ha customerName, customerStreet ecc.)
  const isManual = !!body.manual;
  if (isManual && !hasPermission(session?.user, "ORDERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { items, shippingFee } = body;
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = subtotal + (shippingFee ?? 7);

  let code;
  let exists = true;
  while (exists) {
    code = generateOrderCode();
    exists = await prisma.order.findUnique({ where: { code } });
  }

  const order = await prisma.order.create({
    data: {
      code,
      userId: body.userId || session?.user?.id || null,
      subtotal,
      shippingFee: shippingFee ?? 7,
      total,
      customerName: body.customerName || null,
      customerStreet: body.customerStreet || null,
      customerCity: body.customerCity || null,
      customerZip: body.customerZip || null,
      customerPhone: body.customerPhone || null,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          variantName: i.variantName || null,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: isManual ? "ORDER_CREATE_MANUAL" : "ORDER_CREATE",
      entity: "Order",
      after: order,
      userId: session?.user?.id || null,
    },
  });

  return NextResponse.json({ code: order.code, total: order.total, id: order.id });
}
