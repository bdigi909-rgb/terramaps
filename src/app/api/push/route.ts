import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:admin@terramaps.ma",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

// Sauvegarder subscription
export async function POST(req: NextRequest) {
  const { subscription } = await req.json();
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      keys JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    INSERT INTO push_subscriptions (endpoint, keys)
    VALUES (${subscription.endpoint}, ${JSON.stringify(subscription.keys)})
    ON CONFLICT (endpoint) DO NOTHING
  `);
  return NextResponse.json({ success: true });
}

// Envoyer une notification push
export async function PUT(req: NextRequest) {
  const { title, body, url } = await req.json();
  const result = await db.execute(sql`SELECT * FROM push_subscriptions`);
  
  const payload = JSON.stringify({ title, body, url: url || "/dashboard" });
  
  for (const row of result.rows as any[]) {
    try {
      await webpush.sendNotification({
        endpoint: row.endpoint,
        keys: row.keys
      }, payload);
    } catch (err) {
      console.error("Push error:", err);
    }
  }
  return NextResponse.json({ success: true, sent: result.rows.length });
}
