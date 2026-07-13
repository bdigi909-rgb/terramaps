import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { missionId, email } = await req.json();
  
  const result = await db.execute(sql`SELECT * FROM missions WHERE id = ${missionId}`);
  if (result.rows.length === 0) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
  
  const mission = result.rows[0] as any;
  const toEmail = email || mission.email_technicien;
  if (!toEmail) return NextResponse.json({ error: "Email technicien manquant" }, { status: 400 });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: toEmail,
    subject: `📅 Rappel mission: ${mission.titre}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a2f46; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #F97316; margin: 0;">TerraMaps</h1>
          <p style="color: #8BACC8; margin: 4px 0 0;">Rappel de mission terrain</p>
        </div>
        <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a2f46;">📅 ${mission.titre}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748B;">Projet:</td><td style="font-weight: 600;">${mission.projet || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748B;">Technicien:</td><td style="font-weight: 600;">${mission.technicien || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748B;">Date:</td><td style="font-weight: 600; color: #F97316;">${mission.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748B;">Statut:</td><td style="font-weight: 600;">${mission.statut}</td></tr>
          </table>
          <p style="color: #64748B; margin-top: 16px; font-size: 13px;">Ce message est un rappel automatique de TerraMaps.</p>
        </div>
      </div>
    `
  });

  await db.execute(sql`UPDATE missions SET rappel_envoye = TRUE WHERE id = ${missionId}`);
  return NextResponse.json({ success: true });
}
