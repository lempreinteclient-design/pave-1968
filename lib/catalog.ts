import { DEMO_PRODUCTS } from "./demo";
import * as printify from "./printify";
import type { Product } from "./types";

export const isDemo = () => !printify.printifyConfigured();

export async function listProducts(): Promise<Product[]> {
  return isDemo() ? DEMO_PRODUCTS : printify.listProducts();
}

export async function getProduct(id: string, opts: { fresh?: boolean } = {}): Promise<Product | null> {
  if (isDemo()) return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  return opts.fresh ? printify.getProductFresh(id) : printify.getProduct(id);
}

export function imageFor(product: Product, variantId?: number) {
  const match = variantId ? product.images.find((i) => i.variantIds.includes(variantId)) : undefined;
  return (match ?? product.images.find((i) => i.isDefault) ?? product.images[0])?.src ?? "";
}

export function lowestPrice(product: Product) {
  const prices = product.variants.filter((v) => v.available).map((v) => v.price);
  return prices.length ? Math.min(...prices) : 0;
}
