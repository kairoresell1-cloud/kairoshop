import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const cleanCode = decodeURIComponent(params.code).trim().toUpperCase();

  const orderCode = await prisma.orderCode.findUnique({
    where: { code: cleanCode },
  });

  if (!orderCode) return NextResponse.json({ error: "Codice non trovato" }, { status: 404 });

  // OrderCode non ha una relazione diretta a User (solo userId testuale),
  // quindi il cliente collegato va recuperato a parte, se presente.
  const user = orderCode.userId
    ? await prisma.user.findUnique({ where: { id: orderCode.userId } })
    : null;

  // Arricchisce gli item (salvati come JSON) con i dati prodotto correnti
  const productIds = orderCode.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const itemsWithProduct = orderCode.items.map((i) => ({
    ...i,
    product: products.find((p) => p.id === i.productId),
  }));

  return NextResponse.json({ ...orderCode, items: itemsWithProduct, user });
}
