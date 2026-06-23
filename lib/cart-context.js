"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const SHIPPING_FEE = 7;
const STORAGE_KEY = "kairo_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(product, quantity = 1, variantName = null) {
    setItems((prev) => {
      const key = `${product.id}-${variantName || "default"}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          title: product.title,
          image: product.images?.[0],
          basePrice: product.basePrice,
          bulkPrices: product.bulkPrices || [],
          variantName,
          quantity,
        },
      ];
    });
  }

  function removeFromCart(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateQuantity(key, quantity) {
    if (quantity <= 0) return removeFromCart(key);
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity } : i))
    );
  }

  function priceForItem(item) {
    // Sconto quantità: prende il prezzo bulk più conveniente attivo
    const applicable = (item.bulkPrices || [])
      .filter((b) => item.quantity >= b.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];
    return applicable ? applicable.price : item.basePrice;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + priceForItem(item) * item.quantity,
    0
  );

  // La spedizione fissa di 7€ può essere annullata da una promozione attiva
  // (free shipping). Quel flag arriva dal checkout dopo verifica server-side.
  const total = subtotal + SHIPPING_FEE;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        priceForItem,
        subtotal,
        shippingFee: SHIPPING_FEE,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
