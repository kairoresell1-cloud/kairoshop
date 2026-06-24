import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

// Body: { delta: number, variantId?: string }
// delta positivo = aggiunta stock (+), negativo = rimozione (-)
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "INVENTORY_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { delta, variantId } = await req.json();

  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return NextResponse.json({ error: "Variante non trovata" }, { status: 404 });
    const newStock = Math.max(0, variant.stock + delta); // mai stock negativo
    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });
    await prisma.auditLog.create({
      data: {
        action: "STOCK_ADJUST_VARIANT",
        entity: "ProductVariant",
        before: variant,
        after: updated,
        userId: session.user.id,
      },
    });
    return NextResponse.json(updated);
  }

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  const newStock = Math.max(0, product.stock + delta);
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { stock: newStock },
  });

  await prisma.auditLog.create({
    data: {
      action: "STOCK_ADJUST",
      entity: "Product",
      before: product,
      after: updated,
      userId: session.user.id,
    },
  });

  return NextResponse.json(updated);
}
