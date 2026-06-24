import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "ORDERS_VIEW")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } }, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
