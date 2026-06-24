import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user, "PRODUCTS_EDIT")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = await req.json();
  const slug = body.name.toLowerCase().trim().replace(/\s+/g, "-");
  const category = await prisma.category.create({
    data: { name: body.name.trim(), slug },
  });
  return NextResponse.json(category, { status: 201 });
}
