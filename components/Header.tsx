"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { count } = useCart();
  return (
    <header className="header">
      <Link href="/" className="logo">
        <span className="logo-pave" aria-hidden>
          1968
        </span>
        PAVÉ
      </Link>
      <nav>
        <Link href="/#collection">Collection</Link>
        <Link href="/panier" className="cart-link">
          Panier{count > 0 && <span className="badge">{count}</span>}
        </Link>
      </nav>
    </header>
  );
}
