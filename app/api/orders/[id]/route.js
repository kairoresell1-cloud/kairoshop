import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_VIEW")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, user: true },
  });
  if (!order) return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  return NextResponse.json(order);
}

// Aggiornamento completo: stato, tracking, etichette, dati cliente, prezzi
// (sconti confidenziali manuali) e articoli.
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const before = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!before) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();

  if (Array.isArray(body.items)) {
    await prisma.orderItem.deleteMany({ where: { orderId: params.id } });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: body.status ?? before.status,
      trackingCarrier: body.trackingCarrier ?? before.trackingCarrier,
      trackingCode: body.trackingCode ?? before.trackingCode,
      labels: body.labels ?? before.labels,
      customerName: body.customerName ?? before.customerName,
      customerSurname: body.customerSurname ?? before.customerSurname,
      customerStreet: body.customerStreet ?? before.customerStreet,
      customerStreetNumber: body.customerStreetNumber ?? before.customerStreetNumber,
      customerCity: body.customerCity ?? before.customerCity,
      customerZip: body.customerZip ?? before.customerZip,
      customerPhone: body.customerPhone ?? before.customerPhone,
      subtotal: body.subtotal ?? before.subtotal,
      shippingFee: body.shippingFee ?? before.shippingFee,
      total: body.total ?? before.total,
      items: Array.isArray(body.items)
        ? { create: body.items.map((i) => ({
            productId: i.productId, variantName: i.variantName || null,
            quantity: i.quantity, unitPrice: i.unitPrice,
          })) }
        : undefined,
    },
  });

  if (order.userId) {
    const userOrders = await prisma.order.findMany({ where: { userId: order.userId } });
    await prisma.user.update({
      where: { id: order.userId },
      data: { totalSpent: userOrders.reduce((s, o) => s + o.total, 0), ordersCount: userOrders.length },
    });
  }

  await prisma.auditLog.create({
    data: { action: "ORDER_UPDATE", entity: "Order", before, after: order, userId: session.user.id },
  });

  return NextResponse.json(order);
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_DELETE")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const before = await prisma.order.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  await prisma.order.delete({ where: { id: params.id } });

  if (before.userId) {
    const userOrders = await prisma.order.findMany({ where: { userId: before.userId } });
    await prisma.user.update({
      where: { id: before.userId },
      data: { totalSpent: userOrders.reduce((s, o) => s + o.total, 0), ordersCount: userOrders.length },
    });
  }

  await prisma.auditLog.create({
    data: { action: "ORDER_DELETE", entity: "Order", before, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
