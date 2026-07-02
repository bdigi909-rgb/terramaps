import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { sendPasswordResetEmail } from "@/lib/email";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return NextResponse.json({ success: true }); // Don't reveal if email exists
  
  const token = await new SignJWT({ id: user.id, email: user.email, type: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(SECRET);

  await sendPasswordResetEmail(user.email, user.name, token);
  return NextResponse.json({ success: true });
}
