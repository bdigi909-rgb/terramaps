import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { devis } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(devis).orderBy(desc(devis.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [created] = await db.insert(devis).values({
    numero: body.numero,
    date: body.date,
    client: body.client,
    clientAdresse: body.clientAdresse,
    clientTel: body.clientTel,
    clientEmail: body.clientEmail,
    projet: body.projet,
    sousTotal: body.sousTotal,
    tva: body.tva,
    total: body.total,
    statut: "en_attente",
    lignes: JSON.stringify(body.lignes),
  }).returning();
  return NextResponse.json(created);
}
