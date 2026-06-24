import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "SUPPLIERS_VIEW")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const suppliers = await prisma.supplier.findMany({
    include: { products: { include: { product: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(suppliers);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "SUPPLIERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      contact: body.contact || null,
      notes: body.notes || null,
      status: body.status || "Attivo",
    },
  });

  await prisma.auditLog.create({
    data: { action: "SUPPLIER_CREATE", entity: "Supplier", after: supplier, userId: session.user.id },
  });

  return NextResponse.json(supplier, { status: 201 });
}
