export type ItemType = 'produit' | 'pack';

export type Unite = 'sac' | 'kg' | 'L' | 'pièce' | 'lot' | 'pack' | 'boîte' | 'bouteille';

export type CatalogueItem = {
  id: string;
  slug: string;
  type: ItemType;
  nom: string;
  categorie: string;
  description: string;
  prix_fcfa: number;
  unite: string;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  disponible: boolean;
  ordre: number;
  composition: string[];
  livraison_gratuite: boolean;
  note?: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  nom: string;
  type: ItemType;
  prix_fcfa: number;
  unite: string;
  quantite: number;
  image_url: string;
  livraison_gratuite: boolean;
  // Calculé au refresh ISR : false si l'item est devenu indisponible
  // depuis l'ajout au panier. On le garde grisé sans le compter dans le total WhatsApp.
  disponible?: boolean;
};

export type Cart = {
  items: CartItem[];
  totalQuantite: number;
  totalFcfa: number;
  hasFreeDeliveryItem: boolean;
};
