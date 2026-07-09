import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { factures } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(factures).orderBy(desc(factures.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [created] = await db.insert(factures).values({
    numero: body.numero,
    date: body.date,
    devisRef: body.devisRef,
    client: body.client,
    clientAdresse: body.clientAdresse,
    clientTel: body.clientTel,
    clientEmail: body.clientEmail,
    projet: body.projet,
    sousTotal: body.sousTotal,
    tva: body.tva,
    timbre: body.timbre,
    total: body.total,
    statut: "non_payee",
    modePaiement: body.modePaiement,
    lignes: JSON.stringify(body.lignes),
  }).returning();
  return NextResponse.json(created);
}
