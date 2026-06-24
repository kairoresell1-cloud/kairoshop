import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(_req, { params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, variants: true, bulkPrices: true },
  });
  if (!product) return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "PRODUCTS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const before = await prisma.product.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  const body = await req.json();

  // Sostituisce completamente varianti e prezzi bulk per semplicità e
  // coerenza (evita stati intermedi inconsistenti tra le due tabelle).
  await prisma.productVariant.deleteMany({ where: { productId: params.id } });
  await prisma.bulkPrice.deleteMany({ where: { productId: params.id } });

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      images: body.images || [],
      basePrice: body.basePrice,
      stock: body.stock,
      tags: body.tags || [],
      badge: body.badge || null,
      categoryId: body.categoryId,
      variants: body.variants?.length
        ? { create: body.variants.map(({ id, ...v }) => v) }
        : undefined,
      bulkPrices: body.bulkPrices?.length
        ? { create: body.bulkPrices.map(({ id, ...b }) => b) }
        : undefined,
    },
    include: { variants: true, bulkPrices: true },
  });

  await prisma.auditLog.create({
    data: {
      action: "PRODUCT_UPDATE",
      entity: "Product",
      before,
      after: product,
      userId: session.user.id,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "PRODUCTS_DELETE")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const before = await prisma.product.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  await prisma.product.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      action: "PRODUCT_DELETE",
      entity: "Product",
      before,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
