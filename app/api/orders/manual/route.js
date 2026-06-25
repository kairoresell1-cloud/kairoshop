import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { nanoid } from "nanoid";

function generateOrderCode() {
  const part = () => nanoid(4).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  return `KS-${part()}-${part()}`;
}

// Body:
// {
//   sourceCode?: string         -> se presente, marca quel OrderCode come "convertito"
//   userEmail?: string          -> collega l'ordine a un cliente esistente (se trovato)
//   customerName, customerSurname, customerStreet, customerStreetNumber,
//   customerCity, customerZip, customerPhone,
//   orderDate?: string (ISO)    -> data dell'ordine, default oggi
//   trackingCode?: string
//   items: [{ productId, variantName, quantity, unitPrice }]  -> unitPrice è
//      già il prezzo FINALE deciso dall'owner (può includere sconti confidenziali)
//   shippingFee: number
//   total?: number              -> se omesso, calcolato da subtotal + shippingFee.
//                                   Se presente, sovrascrive tutto (sconto manuale totale).
// }
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await req.json();
  const { items, shippingFee = 7 } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Nessun prodotto nell'ordine" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = body.total != null ? parseFloat(body.total) : subtotal + shippingFee;

  let linkedUserId = null;
  if (body.userEmail) {
    const user = await prisma.user.findUnique({ where: { email: body.userEmail } });
    if (user) linkedUserId = user.id;
  }

  let code;
  let exists = true;
  while (exists) {
    code = generateOrderCode();
    exists = await prisma.order.findUnique({ where: { code } });
  }

  const order = await prisma.order.create({
    data: {
      code,
      userId: linkedUserId,
      subtotal,
      shippingFee,
      total,
      trackingCode: body.trackingCode || null,
      customerName: body.customerName || null,
      customerSurname: body.customerSurname || null,
      customerStreet: body.customerStreet || null,
      customerStreetNumber: body.customerStreetNumber || null,
      customerCity: body.customerCity || null,
      customerZip: body.customerZip || null,
      customerPhone: body.customerPhone || null,
      createdAt: body.orderDate ? new Date(body.orderDate) : undefined,
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

  // Le statistiche cliente (soldi spesi, conteggio ordini) si aggiornano
  // SOLO ora, quando l'Owner crea/conferma l'ordine — mai prima.
  if (linkedUserId) {
    const userOrders = await prisma.order.findMany({ where: { userId: linkedUserId } });
    await prisma.user.update({
      where: { id: linkedUserId },
      data: { totalSpent: userOrders.reduce((s, o) => s + o.total, 0), ordersCount: userOrders.length },
    });
  }

  if (body.sourceCode) {
    await prisma.orderCode.update({
      where: { code: body.sourceCode },
      data: { converted: true },
    }).catch(() => {});
  }

  await prisma.auditLog.create({
    data: { action: "ORDER_CREATE_MANUAL", entity: "Order", after: order, userId: session.user.id },
  });

  return NextResponse.json(order, { status: 201 });
}
