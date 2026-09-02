"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";
import { calculateShippingFee } from "@/lib/shipping";

const STORAGE_KEY = "liora-cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
  totalWeightKg: number;
  shippingFee: number;
  grandTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clear = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );
  // Weight of everything in the cart combined, priced as a single shipment
  // (not per line item) — see lib/shipping.ts for the courier rate tiers.
  const totalWeightKg = useMemo(
    // weightKg may be missing on items persisted before this field existed;
    // treat those as 0 rather than poisoning the whole sum with NaN.
    () => items.reduce((sum, i) => sum + i.quantity * (i.weightKg || 0), 0),
    [items]
  );
  const shippingFee = useMemo(
    () => calculateShippingFee(totalWeightKg),
    [totalWeightKg]
  );
  const grandTotal = totalPrice + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        totalItems,
        totalPrice,
        totalWeightKg,
        shippingFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
