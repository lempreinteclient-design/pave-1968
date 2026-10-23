"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

type Cart = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: CartItem) => void;
  setQuantity: (variantId: number, productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);
const KEY = "pave-1968-panier";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const same = (a: CartItem, productId: string, variantId: number) => a.productId === productId && a.variantId === variantId;

  const value: Cart = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((n, i) => n + i.quantity * i.price, 0),
    add: (item) =>
      setItems((prev) =>
        prev.some((i) => same(i, item.productId, item.variantId))
          ? prev.map((i) => (same(i, item.productId, item.variantId) ? { ...i, quantity: i.quantity + item.quantity } : i))
          : [...prev, item],
      ),
    setQuantity: (variantId, productId, quantity) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !same(i, productId, variantId))
          : prev.map((i) => (same(i, productId, variantId) ? { ...i, quantity } : i)),
      ),
    clear: () => setItems([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart doit être utilisé dans CartProvider");
  return cart;
}
