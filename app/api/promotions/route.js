import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const promotions = await prisma.promotion.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(promotions);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "PROMOTIONS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const promo = await prisma.promotion.create({
    data: {
      type: body.type,
      active: true,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      rules: body.rules || {},
    },
  });
  return NextResponse.json(promo, { status: 201 });
}
