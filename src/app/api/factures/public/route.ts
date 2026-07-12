import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  const result = await db.execute(sql`SELECT * FROM factures WHERE share_token = ${token} AND share_enabled = TRUE`);
  if (result.rows.length === 0) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}
