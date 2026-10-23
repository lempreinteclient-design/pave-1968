export type OptionValue = { id: number; title: string; colors?: string[] };

export type ProductOption = {
  name: string;
  type: string;
  values: OptionValue[];
};

export type Variant = {
  id: number;
  title: string;
  /** Prix de vente en centimes d'euro */
  price: number;
  available: boolean;
  options: number[];
};

export type ProductImage = {
  src: string;
  variantIds: number[];
  isDefault: boolean;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: Variant[];
};

export type CartItem = {
  productId: string;
  variantId: number;
  quantity: number;
  title: string;
  variantTitle: string;
  price: number;
  image: string;
};

export type ShippingAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
};
