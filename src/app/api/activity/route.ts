import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
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
  const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(100);
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { action, entity, entityId, details } = await req.json();
  const [log] = await db.insert(activityLogs).values({
    userId: user.id as number,
    userName: user.name as string,
    action,
    entity,
    entityId,
    details,
  }).returning();
  return NextResponse.json(log);
}
