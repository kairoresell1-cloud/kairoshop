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

// GET: lista ordini REALI (solo staff) — usata dalla pagina "Visualizza Ordini"
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_VIEW")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

// POST: il cliente genera solo un CODICE (OrderCode). NON crea un ordine
// reale — quello lo crea solo l'Owner, dopo aver ricevuto il codice.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

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
    exists = await prisma.orderCode.findUnique({ where: { code } });
  }

  const orderCode = await prisma.orderCode.create({
    data: {
      code,
      userId: session?.user?.id || null,
      subtotal,
      shippingFee: shippingFee ?? 7,
      total,
      items,
    },
  });

  return NextResponse.json({ code: orderCode.code, total: orderCode.total });
}
