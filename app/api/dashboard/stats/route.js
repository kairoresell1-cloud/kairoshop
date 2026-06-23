import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaff(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const totalOrders = await prisma.order.count();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayOrders = await prisma.order.count({
    where: { createdAt: { gte: startOfDay } },
  });

  const revenueAgg = await prisma.order.aggregate({ _sum: { total: true } });
  const lowStock = await prisma.product.count({ where: { stock: { lt: 5 } } });

  return NextResponse.json({
    totalOrders,
    todayOrders,
    revenue: revenueAgg._sum.total || 0,
    lowStock,
  });
}
