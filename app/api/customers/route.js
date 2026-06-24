import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "USERS_VIEW")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { totalSpent: "desc" },
    include: { orders: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json(users);
}
