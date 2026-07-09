import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, surveyPoints, users, devis, factures } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try { await jwtVerify(token, SECRET); } catch { return NextResponse.json({ error: "Token invalide" }, { status: 401 }); }

  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ projects: [], points: [], users: [], devis: [], factures: [] });

  const [foundProjects, foundPoints, foundUsers, foundDevis, foundFactures] = await Promise.all([
    db.select().from(projects).where(or(
      ilike(projects.name, `%${q}%`),
      ilike(projects.client, `%${q}%`),
      ilike(projects.location, `%${q}%`),
    )).limit(5),
    db.select().from(surveyPoints).where(or(
      ilike(surveyPoints.name, `%${q}%`),
      ilike(surveyPoints.code, `%${q}%`),
    )).limit(5),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(or(
      ilike(users.name, `%${q}%`),
      ilike(users.email, `%${q}%`),
    )).limit(5),
    db.select().from(devis).where(or(ilike(devis.client, `%${q}%`), ilike(devis.numero, `%${q}%`))).limit(5),
    db.select().from(factures).where(or(ilike(factures.client, `%${q}%`), ilike(factures.numero, `%${q}%`))).limit(5),
  ]);
  return NextResponse.json({ projects: foundProjects, points: foundPoints, users: foundUsers, devis: foundDevis, factures: foundFactures });
}
