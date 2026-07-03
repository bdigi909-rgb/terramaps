import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surveyPoints, projects } from "@/db/schema";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try { await jwtVerify(token, SECRET); } catch { return NextResponse.json({ error: "Token invalide" }, { status: 401 }); }

  const x = parseFloat(req.nextUrl.searchParams.get("x") || "0");
  const y = parseFloat(req.nextUrl.searchParams.get("y") || "0");
  const radius = parseFloat(req.nextUrl.searchParams.get("radius") || "100");

  if (isNaN(x) || isNaN(y)) return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });

  const allPoints = await db.select().from(surveyPoints);
  const allProjects = await db.select().from(projects);

  const nearby = allPoints
    .map(pt => {
      const dx = pt.x - x;
      const dy = pt.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const project = allProjects.find(p => p.id === pt.projectId);
      return { ...pt, distance, projectName: project?.name };
    })
    .filter(pt => pt.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  return NextResponse.json(nearby);
}
