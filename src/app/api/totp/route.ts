import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { jwtVerify } from "jose";
import { generateSecret, TOTP, generateURI, verify } from "otplib";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

async function getUser(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const secret = generateSecret();
  const otpauth = generateURI({ secret, label: user.email as string, issuer: "TerraMaps" });
  await db.execute(sql`UPDATE users SET totp_secret = ${secret} WHERE id = ${user.id as number}`);
  return NextResponse.json({ secret, otpauth });
}

export async function PUT(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  const { code } = await req.json();
  const result = await db.execute(sql`SELECT totp_secret FROM users WHERE id = ${user.id as number}`);
  const secret = result.rows[0]?.totp_secret as string;
  if (!secret) return NextResponse.json({ error: "Secret non trouve" }, { status: 400 });
  const isValid = verify({ secret, token: code });
  if (!isValid) return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  await db.execute(sql`UPDATE users SET totp_enabled = TRUE WHERE id = ${user.id as number}`);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const { userId, code } = await req.json();
  const result = await db.execute(sql`SELECT totp_secret, totp_enabled FROM users WHERE id = ${userId}`);
  const row = result.rows[0] as any;
  if (!row?.totp_enabled) return NextResponse.json({ success: true, skip: true });
  const isValid = verify({ secret: row.totp_secret, token: code });
  if (!isValid) return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  await db.execute(sql`UPDATE users SET totp_enabled = FALSE, totp_secret = NULL WHERE id = ${user.id as number}`);
  return NextResponse.json({ success: true });
}
