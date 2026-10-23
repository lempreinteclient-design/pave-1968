export const metadata = { title: "Conditions générales de vente · Pavé 1968" };

export default function TermsPage() {
  return (
    <section className="page prose">
      <h1>Conditions générales de vente</h1>
      <p><strong>Modèle à relire et compléter avant la mise en ligne.</strong></p>
      <h2>Produits et prix</h2>
      <p>Les prix sont indiqués en euros TTC. Les frais de livraison sont affichés avant le paiement.</p>
      <h2>Commande et paiement</h2>
      <p>La commande est ferme après paiement par carte via Stripe. Un e-mail de confirmation est envoyé.</p>
      <h2>Fabrication et livraison</h2>
      <p>Chaque article est imprimé à la demande. Comptez 3 à 6 jours ouvrés de fabrication puis 2 à 5 jours de livraison en Europe.</p>
      <h2>Droit de rétractation</h2>
      <p>Tu disposes de 14 jours après réception pour te rétracter, en écrivant à [e-mail]. Les frais de retour sont à ta charge. Le remboursement intervient sous 14 jours après réception du retour.</p>
      <h2>Article défectueux</h2>
      <p>Si un article arrive abîmé ou mal imprimé, envoie une photo à [e-mail] dans les 30 jours : il est remplacé ou remboursé.</p>
      <h2>Médiation</h2>
      <p>En cas de litige, tu peux recourir gratuitement au médiateur de la consommation : [nom et site du médiateur].</p>
    </section>
  );
}
