import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "reset") return NextResponse.json({ error: "Token invalide" }, { status: 400 });
    const hash = await bcrypt.hash(password, 10);
    await db.update(users).set({ password: hash }).where(eq(users.id, payload.id as number));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Token expiré ou invalide" }, { status: 400 });
  }
}
