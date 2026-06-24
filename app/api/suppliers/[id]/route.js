import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "SUPPLIERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const supplier = await prisma.supplier.update({ where: { id: params.id }, data: body });
  return NextResponse.json(supplier);
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "SUPPLIERS_DELETE")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  await prisma.supplier.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
