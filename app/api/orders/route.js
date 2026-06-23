import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

function generateOrderCode() {
  const part = () => nanoid(4).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  return `KS-${part()}-${part()}`;
}

// Checkout: NON elabora nessun pagamento. Genera solo il codice ordine
// che il cliente copia e invia per finalizzare manualmente (bonifico,
// contanti, accordo diretto ecc. — gestito fuori piattaforma).
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  const { items, shippingFee } = body;
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
  }

  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
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
      userId: session?.user?.id || null,
      subtotal,
      shippingFee: shippingFee ?? 7,
      total,
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
      action: "ORDER_CREATE",
      entity: "Order",
      after: order,
      userId: session?.user?.id || null,
    },
  });

  return NextResponse.json({ code: order.code, total: order.total });
}
