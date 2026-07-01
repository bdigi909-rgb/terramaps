import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

async function getUser(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const notifs = await db.select().from(notifications)
    .where(eq(notifications.userId, user.id as number))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
  return NextResponse.json(notifs);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { userId, title, message, type } = await req.json();
  const [notif] = await db.insert(notifications).values({ userId, title, message, type: type || "info" }).returning();
  return NextResponse.json(notif);
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { id } = await req.json();
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  return NextResponse.json({ success: true });
}
