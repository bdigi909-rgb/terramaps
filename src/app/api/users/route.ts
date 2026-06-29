import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

async function getUser(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user || (user.role !== "admin" && user.role !== "manager")) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const list = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { name, email, password, role } = await req.json();
  const hash = await bcrypt.hash(password, 10);
  const [created] = await db.insert(users).values({ name, email, password: hash, role }).returning();
  return NextResponse.json({ id: created.id, name: created.name, email: created.email, role: created.role });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { id } = await req.json();
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
