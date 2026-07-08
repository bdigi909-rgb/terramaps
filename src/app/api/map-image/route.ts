import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  if (!lat || !lng) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  
  const apiKey = "0b9fa41ea5be40669f80a2f288c488ec";
  const url = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=280&center=lonlat:${lng},${lat}&zoom=15&marker=lonlat:${lng},${lat};color:red;size:medium&apiKey=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) return NextResponse.json({ error: "Map fetch failed" }, { status: 500 });
  
  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
