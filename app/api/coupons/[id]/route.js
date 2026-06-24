import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "COUPONS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const coupon = await prisma.coupon.update({ where: { id: params.id }, data: body });
  return NextResponse.json(coupon);
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "COUPONS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  await prisma.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
