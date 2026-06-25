import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "USERS_VIEW")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "USERS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const before = await prisma.user.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      adminNotes: body.adminNotes ?? before.adminNotes,
      customerLevel: body.customerLevel ?? before.customerLevel,
      banned: body.banned ?? before.banned,
    },
  });

  await prisma.auditLog.create({
    data: { action: body.banned ? "CUSTOMER_BAN" : "CUSTOMER_UPDATE", entity: "User", before, after: user, userId: session.user.id },
  });

  return NextResponse.json(user);
}
