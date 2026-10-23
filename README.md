# Pavé 1968

Boutique de t-shirts sur mesure (Next.js) connectée à Printify, avec paiement Stripe.

- Le catalogue est lu en direct depuis ta boutique Printify (produits, couleurs, tailles, prix, photos).
- Le client paie sur Stripe Checkout. Les prix sont relus côté serveur, jamais pris du navigateur.
- Après paiement, un webhook Stripe crée automatiquement la commande chez Printify avec l'adresse du client.
- Sans clés configurées, le site tourne en **mode démo** avec 10 t-shirts d'exemple.

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis remplis les clés
npm run dev                  # http://localhost:3000
```

## Configurer Printify

1. Sur printify.com, crée une boutique de type **API / Custom integration** (Manage my stores > Add new store > API).
2. Mon compte > Connections : génère un **API token** avec les droits `shops`, `products` et `orders`. Mets-le dans `PRINTIFY_API_TOKEN`.
3. Trouve l'identifiant de la boutique :
   ```bash
   curl -H "Authorization: Bearer TON_TOKEN" https://api.printify.com/v1/shops.json
   ```
   Copie le champ `id` de la boutique API dans `PRINTIFY_SHOP_ID`.
4. Crée tes produits dans Printify (choisis un imprimeur européen), fixe le prix de vente : ils apparaissent sur le site sous 5 minutes.

`PRINTIFY_AUTO_PRODUCTION=false` laisse chaque commande « On hold » dans Printify pour que tu la valides. Passe à `true` quand tout est rodé.

## Configurer Stripe

1. Dashboard Stripe > Developers > API keys : copie la clé secrète dans `STRIPE_SECRET_KEY` (commence par `sk_test_` en test).
2. Developers > Webhooks > Add endpoint : URL `https://TON-DOMAINE/api/stripe/webhook`, événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`. Copie le « Signing secret » dans `STRIPE_WEBHOOK_SECRET`.
3. En local, utilise la CLI Stripe : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

Carte de test : `4242 4242 4242 4242`, date future, CVC quelconque.

## Mettre en ligne (Vercel)

1. Pousse ce dépôt sur GitHub.
2. Sur vercel.com, « Add New Project » > importe le dépôt.
3. Ajoute les variables de `.env.example` dans Settings > Environment Variables. `NEXT_PUBLIC_SITE_URL` est facultatif sur Vercel (l'adresse de production est détectée), à remplir seulement avec un domaine perso.
4. Déploie, puis crée le webhook Stripe avec l'URL de production.

## Avant d'ouvrir

- Compléter `app/mentions-legales` et `app/cgv` (SIRET, adresse, e-mail, médiateur).
- Commander un échantillon de chaque t-shirt.
- Faire une commande test de bout en bout en mode test Stripe.

## Structure

| Fichier | Rôle |
| --- | --- |
| `lib/printify.ts` | Appels à l'API Printify (produits, commandes) |
| `lib/demo.ts` | Catalogue de démonstration |
| `app/api/checkout` | Crée la session de paiement Stripe |
| `app/api/stripe/webhook` | Reçoit le paiement et crée la commande Printify |
| `app/produit/[id]` | Fiche produit avec choix couleur et taille |
| `app/panier` | Panier (stocké dans le navigateur) |
