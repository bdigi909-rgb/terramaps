import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const result = await db.execute(sql`SELECT * FROM missions ORDER BY date ASC`);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.execute(sql`
    INSERT INTO missions (titre, projet, technicien, date, statut, couleur, email_technicien)
    VALUES (${body.titre}, ${body.projet}, ${body.technicien}, ${body.date}, ${body.statut || "planifiee"}, ${body.couleur || "#F97316"}, ${body.emailTechnicien || null})
    RETURNING *
  `);
  return NextResponse.json(result.rows[0]);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const result = await db.execute(sql`
    UPDATE missions SET statut = ${body.statut} WHERE id = ${body.id} RETURNING *
  `);
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.execute(sql`DELETE FROM missions WHERE id = ${id}`);
  return NextResponse.json({ success: true });
}
