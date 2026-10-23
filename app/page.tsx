import Link from "next/link";
import { imageFor, isDemo, listProducts, lowestPrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const revalidate = 300;

export default async function Home() {
  const products = await listProducts();

  return (
    <>
      <section className="hero">
        <p className="kicker">Depuis 1968</p>
        <h1>
          Sous les pavés,
          <br />
          <span>la rue.</span>
        </h1>
        <p className="lead">
          Des t-shirts entre Mai 68 et la mobilisation étudiante d&apos;aujourd&apos;hui. Imprimés à la demande en Europe, sans stock ni gaspillage.
        </p>
        <Link href="#collection" className="btn">
          Voir la collection
        </Link>
      </section>

      {isDemo() && (
        <p className="demo-banner">Mode démo : catalogue d&apos;exemple. Connecte Printify pour afficher tes vrais produits.</p>
      )}

      <section id="collection" className="collection">
        <h2>La collection</h2>
        {products.length === 0 ? (
          <p>Aucun produit pour l&apos;instant. Crée tes t-shirts dans Printify, ils apparaîtront ici.</p>
        ) : (
          <ul className="grid">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/produit/${p.id}`} className="card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageFor(p)} alt={p.title} loading="lazy" />
                  <h3>{p.title}</h3>
                  <p>{formatPrice(lowestPrice(p))}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
