import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, surveyPoints, alignments, entities } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  let clientEmail: string | null = null;
  try {
    const { jwtVerify } = await import("jose");
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");
    const token = req.cookies.get("tm_token")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.role === "client") clientEmail = payload.email as string;
      if (payload.role === "client_admin") {
        const { users } = await import("@/db/schema");
        const [u] = await db.select().from(users).where(eq(users.id, payload.id as number));
        clientEmail = "client_admin:" + (u as any).company;
      }
      // client_admin voit tous les projets (pas de filtre)
    }
  } catch {}
  try {
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        type: projects.type,
        status: projects.status,
        client: projects.client,
        location: projects.location,
        epsgCode: projects.epsgCode,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientEmail: projects.clientEmail,
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    const filtered = clientEmail 
      ? clientEmail.startsWith("client_admin:") 
        ? rows.filter((p: any) => p.company === clientEmail.split(":")[1])
        : rows.filter((p: any) => p.clientEmail === clientEmail)
      : rows;
    return NextResponse.json(filtered);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db
      .insert(projects)
      .values({
        name: body.name,
        description: body.description ?? null,
        type: body.type ?? "road_design",
        status: body.status ?? "draft",
        client: body.client ?? null,
        location: body.location ?? null,
        epsgCode: body.epsgCode ?? "4326",
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
