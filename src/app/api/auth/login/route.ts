import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Vérifier les tentatives récentes (5 max en 15 minutes)
  try {
    const attempts = await db.execute(sql`
      SELECT COUNT(*) as count FROM login_attempts 
      WHERE email = ${email} AND success = FALSE 
      AND created_at > NOW() - INTERVAL '15 minutes'
    `);
    const count = parseInt((attempts.rows[0] as any).count);
    if (count >= 5) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
    }
  } catch {}

  const [user] = await db.select().from(users).where(eq(users.email, email));
  
  if (!user) {
    await db.execute(sql`INSERT INTO login_attempts (email, ip, success) VALUES (${email}, ${ip}, FALSE)`).catch(() => {});
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await db.execute(sql`INSERT INTO login_attempts (email, ip, success) VALUES (${email}, ${ip}, FALSE)`).catch(() => {});
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

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

  await db.execute(sql`INSERT INTO login_attempts (email, ip, success) VALUES (${email}, ${ip}, TRUE)`).catch(() => {});

  const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("tm_token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
