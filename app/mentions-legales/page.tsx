export const metadata = { title: "Mentions légales · Pavé 1968" };

export default function LegalPage() {
  return (
    <section className="page prose">
      <h1>Mentions légales</h1>
      <p><strong>À compléter avant la mise en ligne.</strong></p>
      <h2>Éditeur du site</h2>
      <p>[Nom, prénom ou raison sociale] · [Statut, ex. micro-entreprise] · SIRET [numéro] · [Adresse] · [E-mail de contact]</p>
      <h2>Directeur de la publication</h2>
      <p>[Nom]</p>
      <h2>Hébergeur</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
      <h2>Fabrication et expédition</h2>
      <p>Les produits sont imprimés à la demande et expédiés par des partenaires d&apos;impression via Printify.</p>
      <h2>Données personnelles</h2>
      <p>Les données de commande (nom, adresse, e-mail, téléphone) servent uniquement à traiter et livrer la commande. Le paiement est géré par Stripe ; aucune donnée bancaire n&apos;est stockée sur ce site. Pour toute demande d&apos;accès ou de suppression : [e-mail].</p>
    </section>
  );
}
