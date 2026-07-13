import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  const token = await new SignJWT({ id: user.id, role: user.role, name: user.name, email: user.email, company: (user as any).company })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
  await db.insert(activityLogs).values({
    userId: user.id,
    userName: user.name,
    action: "LOGIN",
    entity: "user",
    entityId: user.id,
    details: "Connexion de " + user.name + " (" + user.email + ")",
  }).catch(() => {});
  const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("tm_token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
