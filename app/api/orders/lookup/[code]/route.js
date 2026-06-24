import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { code: params.code },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) return NextResponse.json({ error: "Codice ordine non trovato" }, { status: 404 });

  return NextResponse.json(order);
}
