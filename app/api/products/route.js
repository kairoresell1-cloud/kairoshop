import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true, bulkPrices: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "PRODUCTS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      title: body.title,
      description: body.description,
      images: body.images || [],
      basePrice: body.basePrice,
      stock: body.stock || 0,
      tags: body.tags || [],
      badge: body.badge || null,
      categoryId: body.categoryId,
      variants: body.variants
        ? { create: body.variants }
        : undefined,
      bulkPrices: body.bulkPrices
        ? { create: body.bulkPrices }
        : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "PRODUCT_CREATE",
      entity: "Product",
      after: product,
      userId: session.user.id,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
