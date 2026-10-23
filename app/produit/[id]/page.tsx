import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { getProduct, imageFor } from "@/lib/catalog";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product ? `${product.title} · Pavé 1968` : "Pavé 1968" };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  const images = Object.fromEntries(product.variants.map((v) => [v.id, imageFor(product, v.id)]));
  const gallery = product.images.slice(0, 4);

  return (
    <article className="product">
      <div className="gallery">
        {gallery.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.src + i} src={img.src} alt={product.title} className={i === 0 ? "main" : "thumb"} />
        ))}
      </div>
      <div className="details">
        <h1>{product.title}</h1>
        <div className="description" dangerouslySetInnerHTML={{ __html: product.description }} />
        <AddToCart product={product} images={images} />
        <p className="note">Imprimé à la demande en Europe. Expédition sous 3 à 6 jours ouvrés.</p>
      </div>
    </article>
  );
}
