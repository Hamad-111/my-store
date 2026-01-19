// ✅ src/context/CartContext.jsx (FULL REWRITE with STOCK CAP)
// - qty can NEVER exceed stockQuantity
// - works with id + size unique key
// - clamps in addToCart + increaseQty + updateQty (and decreaseQty safe)
// - keeps stockQuantity stored on cart item for future caps

import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

// ✅ unique key by id + size
const keyOf = (item) => `${String(item.id)}__${String(item.size || '')}`;

// ✅ clamp helper (min 1, max = stock)
const clampQty = (qty, max) => {
  const q = Math.max(1, Number(qty || 1));
  const m = Math.max(1, Number(max || 1));
  return Math.min(q, m);
};

// ✅ read max stock from item (if missing => treat as 1 to be safe)
const maxStockOf = (item) => {
  const max = Number(item?.stockQuantity ?? item?.stock_quantity ?? 1);
  return Number.isFinite(max) && max > 0 ? max : 1;
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // ✅ Add product to cart (merge by id+size) with STOCK CAP
  const addToCart = (product) => {
    const incomingKey = keyOf(product);

    setCart((prev) => {
      const idx = prev.findIndex((it) => keyOf(it) === incomingKey);

      // ✅ max stock prefer incoming value, otherwise existing
      const incomingMax = maxStockOf(product);

      if (idx >= 0) {
        const next = [...prev];

        const existing = next[idx];
        const existingQty = Number(existing.qty || 1);

        // if existing has higher stockQuantity saved, keep the latest/bigger one
        const max = Math.max(maxStockOf(existing), incomingMax);

        const incomingQty = Math.max(1, Number(product.qty || 1));
        const nextQty = clampQty(existingQty + incomingQty, max);

        next[idx] = {
          ...existing,
          ...product, // allow updating fields like price/image/name if changed
          qty: nextQty,
          stockQuantity: max, // ✅ keep max on cart item
        };

        return next;
      }

      // new item
      const incomingQty = Math.max(1, Number(product.qty || 1));
      const startQty = clampQty(incomingQty, incomingMax);

      return [
        ...prev,
        {
          ...product,
          qty: startQty,
          stockQuantity: incomingMax, // ✅ store for later
        },
      ];
    });
  };

  // ✅ Remove item (by id+size)
  const removeFromCart = (id, size = null) => {
    const k = `${String(id)}__${String(size || '')}`;
    setCart((prev) => prev.filter((it) => keyOf(it) !== k));
  };

  // ✅ Increase qty (by id+size) with STOCK CAP
  const increaseQty = (id, size = null) => {
    const k = `${String(id)}__${String(size || '')}`;
    setCart((prev) =>
      prev.map((it) => {
        if (keyOf(it) !== k) return it;

        const max = maxStockOf(it);
        const nextQty = clampQty(Number(it.qty || 1) + 1, max);

        // if already at max, keep same qty
        return { ...it, qty: nextQty, stockQuantity: max };
      })
    );
  };

  // ✅ Decrease qty (by id+size) (min 1)
  const decreaseQty = (id, size = null) => {
    const k = `${String(id)}__${String(size || '')}`;
    setCart((prev) =>
      prev.map((it) => {
        if (keyOf(it) !== k) return it;

        const nextQty = Math.max(1, Number(it.qty || 1) - 1);
        return { ...it, qty: nextQty };
      })
    );
  };

  // ✅ Optional but recommended: direct set qty (input field) with STOCK CAP
  const updateQty = (id, size = null, qty = 1) => {
    const k = `${String(id)}__${String(size || '')}`;
    setCart((prev) =>
      prev.map((it) => {
        if (keyOf(it) !== k) return it;

        const max = maxStockOf(it);
        return { ...it, qty: clampQty(qty, max), stockQuantity: max };
      })
    );
  };

  // ✅ Clear Cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        updateQty, // ✅ add this (if you want qty input support)
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
