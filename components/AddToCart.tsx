"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCart({ product, images }: { product: Product; images: Record<number, string> }) {
  const { add } = useCart();
  const first = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selected, setSelected] = useState<number[]>(first?.options ?? []);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => product.variants.find((v) => selected.every((id) => v.options.includes(id))),
    [product.variants, selected],
  );

  function pick(optionIndex: number, valueId: number) {
    const next = [...selected];
    next[optionIndex] = valueId;
    setSelected(next);
    setAdded(false);
  }

  function onAdd() {
    if (!variant) return;
    add({
      productId: product.id,
      variantId: variant.id,
      quantity,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      image: images[variant.id] ?? "",
    });
    setAdded(true);
  }

  return (
    <div className="buy">
      <p className="price">{variant ? formatPrice(variant.price) : "Indisponible"}</p>
      {product.options.map((option, oi) => (
        <fieldset key={option.name} className="option">
          <legend>{option.name}</legend>
          <div className="choices">
            {option.values.map((value) => (
              <button
                key={value.id}
                type="button"
                className={selected[oi] === value.id ? "choice active" : "choice"}
                onClick={() => pick(oi, value.id)}
              >
                {value.colors?.[0] && <span className="swatch" style={{ background: value.colors[0] }} />}
                {value.title}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="row">
        <label className="qty">
          Quantité
          <input type="number" min={1} max={20} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
        </label>
        <button className="btn" disabled={!variant?.available} onClick={onAdd}>
          {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
