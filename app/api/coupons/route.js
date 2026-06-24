import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "COUPONS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase().trim(),
      percentOff: body.percentOff ? parseFloat(body.percentOff) : null,
      fixedOff: body.fixedOff ? parseFloat(body.fixedOff) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      usageLimit: body.usageLimit ? parseInt(body.usageLimit, 10) : null,
      active: true,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}
