'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/lib/types';
import {
  cartTotal,
  cartTotalQuantite,
  hasFreeDeliveryItem,
  minQtyFor,
} from '@/lib/cart';

const STORAGE_KEY = 'keur-bally-cart';

type CartContextValue = {
  items: CartItem[];
  totalQuantite: number;
  totalFcfa: number;
  hasFreeDeliveryItem: boolean;
  isHydrated: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantite: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydratation localStorage : uniquement côté client après montage,
  // pour éviter le mismatch SSR.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore (quota / private mode)
    }
  }, [items, isHydrated]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === newItem.productId);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantite: next[existingIdx].quantite + newItem.quantite,
        };
        return next;
      }
      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantite: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (!item) return prev;
      // En dessous du minimum, on supprime la ligne.
      if (quantite < minQtyFor(item.unite)) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((i) => (i.productId === productId ? { ...i, quantite } : i));
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalQuantite: cartTotalQuantite(items),
      totalFcfa: cartTotal(items),
      hasFreeDeliveryItem: hasFreeDeliveryItem(items),
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, isHydrated, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
