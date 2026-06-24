import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const before = await prisma.order.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: body.status ?? before.status,
      trackingCarrier: body.trackingCarrier ?? before.trackingCarrier,
      trackingCode: body.trackingCode ?? before.trackingCode,
      labels: body.labels ?? before.labels,
    },
  });

  // Se l'ordine viene segnato come consegnato/completato, aggiorna le
  // statistiche del cliente (per il CRM).
  if (body.status && body.status !== before.status && order.userId) {
    const userOrders = await prisma.order.findMany({ where: { userId: order.userId } });
    const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);
    await prisma.user.update({
      where: { id: order.userId },
      data: { totalSpent, ordersCount: userOrders.length },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "ORDER_UPDATE",
      entity: "Order",
      before,
      after: order,
      userId: session.user.id,
    },
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

  await prisma.auditLog.create({
    data: { action: "ORDER_DELETE", entity: "Order", before, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
