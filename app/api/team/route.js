import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRoles } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!canManageRoles(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "OWNER", "SUPER_OWNER"] } },
    include: { permissions: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(staff);
}

// Body: { userId, role?, permissions?: string[] }
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!canManageRoles(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { userId, role, permissions } = await req.json();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  // Nessuno può rimuovere o retrocedere il Super Owner principale.
  if (target.role === "SUPER_OWNER") {
    return NextResponse.json(
      { error: "Il Super Owner non può essere modificato" },
      { status: 403 }
    );
  }

  // Solo SUPER_OWNER può creare altri OWNER (un Owner non può promuovere a Owner).
  if (role === "OWNER" && session.user.role !== "SUPER_OWNER") {
    return NextResponse.json(
      { error: "Solo il Super Owner può assegnare il ruolo Owner" },
      { status: 403 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: role ?? target.role },
  });

  if (Array.isArray(permissions)) {
    await prisma.permission.deleteMany({ where: { userId } });
    if (permissions.length > 0) {
      await prisma.permission.createMany({
        data: permissions.map((key) => ({ userId, key })),
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      action: "TEAM_UPDATE",
      entity: "User",
      before: target,
      after: updated,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}

// Promuove un utente esistente (per email) ad ADMIN, oppure rimuove permessi Admin
// riportandolo a USER. Body: { email, action: "promote" | "demote" }
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!canManageRoles(session?.user)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const { email, action } = await req.json();

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) {
    return NextResponse.json(
      { error: "Nessun utente trovato con questa email. Deve aver effettuato login almeno una volta." },
      { status: 404 }
    );
  }
  if (target.role === "SUPER_OWNER") {
    return NextResponse.json({ error: "Non modificabile" }, { status: 403 });
  }

  const newRole = action === "demote" ? "USER" : "ADMIN";
  const updated = await prisma.user.update({
    where: { email },
    data: { role: newRole },
  });

  await prisma.auditLog.create({
    data: {
      action: action === "demote" ? "TEAM_DEMOTE" : "TEAM_PROMOTE",
      entity: "User",
      before: target,
      after: updated,
      userId: session.user.id,
    },
  });

  return NextResponse.json(updated);
}
