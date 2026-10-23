import { demoDesign } from "@/lib/demo";

// Maquette SVG d'un t-shirt pour le mode démo
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const design = demoDesign((await params).id);
  if (!design) return new Response("Introuvable", { status: 404 });

  const lines = wrap(design.slogan, 13);
  const size = lines.length > 2 ? 30 : 36;
  const startY = 270 - ((lines.length - 1) * size * 1.05) / 2;
  const text = lines
    .map((l, i) => `<text x="300" y="${startY + i * size * 1.05}" font-size="${size}">${escape(l)}</text>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#E9E1D3"/>
  <path d="M210 70 L150 90 L60 160 L105 240 L160 210 L160 540 L440 540 L440 210 L495 240 L540 160 L450 90 L390 70 C380 110 345 130 300 130 C255 130 220 110 210 70 Z"
    fill="${design.shirt}" stroke="#00000022" stroke-width="3"/>
  <g fill="${design.ink}" font-family="Anton, Impact, 'Arial Narrow', sans-serif" text-anchor="middle" letter-spacing="1">${text}</g>
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}

function wrap(text: string, max: number) {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    if (current && (current + " " + word).length > max) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
