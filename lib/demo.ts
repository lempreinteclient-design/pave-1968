import type { Product } from "./types";

// Catalogue de démonstration affiché tant que Printify n'est pas connecté.
// Les slogans viennent du doc "Pavé 1968 : boutique, identité et designs".
const DESIGNS: { slug: string; slogan: string; shirt: string; colorName: string; ink: string; blurb: string }[] = [
  { slug: "sous-les-paves", slogan: "SOUS LES PAVÉS, LA PLAGE", shirt: "#F4EFE6", colorName: "Blanc cassé", ink: "#D62828", blurb: "Le classique de Mai 68, toujours d'actualité." },
  { slug: "sous-les-paves-le-partiel", slogan: "SOUS LES PAVÉS, LE PARTIEL", shirt: "#111111", colorName: "Noir", ink: "#F4EFE6", blurb: "Pour ceux qui révisent entre deux AG." },
  { slug: "imagination-au-pouvoir", slogan: "L'IMAGINATION AU POUVOIR", shirt: "#D62828", colorName: "Rouge", ink: "#F4EFE6", blurb: "Le slogan peint sur les murs de la Sorbonne." },
  { slug: "demandez-l-impossible", slogan: "SOYEZ RÉALISTES, DEMANDEZ L'IMPOSSIBLE", shirt: "#F4EFE6", colorName: "Blanc cassé", ink: "#111111", blurb: "Trois lignes, style affiche." },
  { slug: "interdit-d-interdire", slogan: "IL EST INTERDIT D'INTERDIRE", shirt: "#111111", colorName: "Noir", ink: "#D62828", blurb: "Un panneau sens interdit, barré." },
  { slug: "meme-combat", slogan: "1968 → AUJOURD'HUI : MÊME COMBAT", shirt: "#F4EFE6", colorName: "Blanc cassé", ink: "#2B3A55", blurb: "Deux générations dans la rue." },
  { slug: "les-pates", slogan: "LES PÂTES NE SONT PAS UN PROGRAMME", shirt: "#D62828", colorName: "Rouge", ink: "#111111", blurb: "La fourchette levée comme un poing." },
  { slug: "pas-a-vendre", slogan: "ÉTUDIANT, PAS RENTABLE, PAS À VENDRE", shirt: "#111111", colorName: "Noir", ink: "#F4EFE6", blurb: "Le code-barres qui se brise." },
  { slug: "le-savoir-est-un-pave", slogan: "LE SAVOIR EST UN PAVÉ", shirt: "#2B3A55", colorName: "Bleu pavé", ink: "#F4EFE6", blurb: "Un livre ouvert, lourd comme un pavé." },
  { slug: "logo", slogan: "PAVÉ 1968", shirt: "#F4EFE6", colorName: "Blanc cassé", ink: "#111111", blurb: "La pièce basique de la marque." },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function demoDesign(slug: string) {
  return DESIGNS.find((d) => d.slug === slug);
}

export const DEMO_PRODUCTS: Product[] = DESIGNS.map((d, i) => {
  const colorId = 1000 + i;
  return {
    id: d.slug,
    title: d.slogan,
    description: `<p>${d.blurb}</p><p>T-shirt unisexe 100 % coton, imprimé à la demande en Europe.</p>`,
    images: [{ src: `/api/demo-image/${d.slug}`, variantIds: [], isDefault: true }],
    options: [
      { name: "Couleur", type: "color", values: [{ id: colorId, title: d.colorName, colors: [d.shirt] }] },
      { name: "Taille", type: "size", values: SIZES.map((s, j) => ({ id: j + 1, title: s })) },
    ],
    variants: SIZES.map((s, j) => ({
      id: (i + 1) * 100 + j,
      title: `${d.colorName} / ${s}`,
      price: 2900,
      available: true,
      options: [colorId, j + 1],
    })),
  };
});
