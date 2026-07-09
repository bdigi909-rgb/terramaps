import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surveyPoints, notifications } from "@/db/schema";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "terramaps-secret-2026");
async function getUser(req: NextRequest) {
  const token = req.cookies.get("tm_token")?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

function parseCSV(content: string) {
  const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("#"));
  const points = [];
  for (const line of lines) {
    const cols = line.split(/[,;\t ]+/).filter(Boolean);
    if (cols.length >= 3) {
      const nums = cols.map(Number).filter(n => !isNaN(n));
        const hasName = cols[0] && isNaN(Number(cols[0]));
        const code = hasName && cols[1] && isNaN(Number(cols[1])) ? cols[1] : "TN";
        const autoName = `${code}${String(points.length + 1).padStart(3, "0")}`;
        points.push({ name: hasName ? cols[0] : autoName, x: nums[0], y: nums[1], z: nums[2] });
        points.push({ name: cols[0] && isNaN(Number(cols[0])) ? cols[0] : `P${points.length + 1}`, x: nums[0], y: nums[1], z: nums[2] });
      }
    }
  }
  return points;
}

function parseGSI(content: string) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  const points: any[] = [];
  let current: any = {};
  for (const line of lines) {
    const words = line.match(/\d{6}[+-]\d{16}/g) || line.match(/\*?\d{6}[+-]\d{8}/g) || [];
    for (const word of words) {
      const code = word.substring(0, 2);
      const val = parseFloat(word.slice(-7)) / 1000;
      if (code === "11") current.name = word.slice(8, 16).trim();
      if (code === "81") current.x = val;
      if (code === "82") current.y = val;
      if (code === "83") { current.z = val; points.push({ ...current }); current = {}; }
    }
  }
  return points;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = parseInt(formData.get("projectId") as string);
    const code = (formData.get("code") as string) || "IMP";
    if (!file || !projectId) return NextResponse.json({ error: "Fichier ou projet manquant" }, { status: 400 });

    const content = await file.text();
    const ext = file.name.split(".").pop()?.toLowerCase();
    let points: any[] = [];

    if (ext === "gsi") points = parseGSI(content);
    else points = parseCSV(content);

    if (points.length === 0) return NextResponse.json({ error: "Aucun point détecté dans le fichier" }, { status: 400 });

    const inserted: any[] = [];
    for (const pt of points) {
      const [row] = await db.insert(surveyPoints).values({
        projectId,
        name: pt.name || `P${inserted.length + 1}`,
        code: (pt.name?.match(/^([A-Z]+)/)?.[1]) || code,
        x: pt.x,
        y: pt.y,
        z: pt.z,
        description: `Importé depuis ${file.name}`,
      }).returning();
      inserted.push(row);
    }

    // Créer notification automatique
    try {
      const user = await getUser(req);
      if (user) {
        await db.insert(notifications).values({
          userId: user.id as number,
          title: "Import réussi",
          message: `${inserted.length} points importés dans le projet #${projectId}`,
          type: "success",
          read: false,
        });
      }
    } catch {}
    return NextResponse.json({ success: true, count: inserted.length, points: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
