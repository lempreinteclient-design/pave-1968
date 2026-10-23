"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export default function ThanksPage() {
  const { clear } = useCart();
  useEffect(() => clear(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="page">
      <h1>Merci, camarade.</h1>
      <p>Ta commande est confirmée. Tu vas recevoir un e-mail de confirmation, puis le suivi dès l&apos;expédition.</p>
      <Link href="/" className="btn">
        Retour à la boutique
      </Link>
    </section>
  );
}
