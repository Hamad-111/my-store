// src/context/WishlistContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  // ✅ If AuthProvider missing, don't crash
  let auth;
  try {
    auth = useAuth();
  } catch (e) {
    auth = { user: null };
  }

  const user = auth?.user || null;

  // ✅ user-based key (separate wishlist per user)
  const storageKey = user?.id ? `vv_wishlist_${user.id}` : 'vv_wishlist_guest';

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ✅ when user changes, load correct wishlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setWishlist(stored ? JSON.parse(stored) : []);
    } catch {
      setWishlist([]);
    }
  }, [storageKey]);

  // ✅ guests can't keep wishlist
  useEffect(() => {}, [user]);

  // ✅ save only when user is logged in
  useEffect(() => {
    try {
      if (user) localStorage.setItem(storageKey, JSON.stringify(wishlist));
      else localStorage.removeItem(storageKey);
    } catch {}
  }, [wishlist, storageKey, user]);

  const isInWishlist = (id) =>
    wishlist.some((item) => String(item.id) === String(id));

  const addToWishlist = (item) => {
    if (!user) return; // ✅ block guest

    setWishlist((prev) => {
      const exists = prev.some((p) => String(p.id) === String(item.id));
      if (exists) return prev;

      return [
        ...prev,
        {
          id: item.id,
          name: item.name || item.title || 'Product',
          title: item.title || item.name || 'Product',
          brand: item.brand || '',
          image: item.image || '',
          price: Number(item.price || 0),
          salePercent: Number(item.salePercent || 0),
          originalPrice: Number(item.originalPrice || item.price || 0),
          tag: item.tag || '',
        },
      ];
    });
  };

  const removeFromWishlist = (id) => {
    if (!user) return;
    setWishlist((prev) => prev.filter((x) => String(x.id) !== String(id)));
  };

  const clearWishlist = () => setWishlist([]);

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      user,
      isLoggedIn: !!user,
    }),
    [wishlist, user]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
