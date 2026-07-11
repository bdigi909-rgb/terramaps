import { NextRequest, NextResponse } from "next/server";
import { sendLeveEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { to, clientName, projectName, superficie, technicien } = await req.json();
  await sendLeveEmail(to, clientName, projectName, superficie, technicien);
  return NextResponse.json({ success: true });
}
