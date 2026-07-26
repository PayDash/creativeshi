import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  const count = req.nextUrl.searchParams.get("count") || "5";
  const unique = req.nextUrl.searchParams.get("unique") || "true";

  if (!user) {
    return new NextResponse("Missing user param", { status: 400 });
  }

  try {
    const res = await fetch(
      `https://spotify-recently-played-readme.vercel.app/api?user=${user}&count=${count}&unique=${unique}`,
      { next: { revalidate: 30 } },
    );
    let svg = await res.text();

    // Make the background rect transparent so it blends into our theme
    svg = svg
      .replace(
        /(<rect data-testid="card-bg"[^>]*?)fill="#212121"/,
        `$1fill="transparent"`,
      )
      .replace(
        /(<rect data-testid="card-bg"[^>]*?)stroke="#212121"/,
        `$1stroke="transparent"`,
      );

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=30, s-maxage=30",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch", { status: 502 });
  }
}
