import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

async function getUser(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { name, currentPassword, newPassword } = await req.json();
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id as number));
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  const updates: any = {};
  if (name && name !== dbUser.name) updates.name = name;
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    updates.password = await bcrypt.hash(newPassword, 10);
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  await db.update(users).set(updates).where(eq(users.id, user.id as number));
  await db.insert(activityLogs).values({ userId: user.id as number, userName: dbUser.name, action: "UPDATE", entity: "user", entityId: user.id as number, details: "Profil mis à jour" }).catch(() => {});
  const updatedName = updates.name || dbUser.name;
  const token = await new SignJWT({ id: dbUser.id, role: dbUser.role, name: updatedName, email: dbUser.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
  const res = NextResponse.json({ success: true, name: updatedName });
  res.cookies.set("tm_token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
