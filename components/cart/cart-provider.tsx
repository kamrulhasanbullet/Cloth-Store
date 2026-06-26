"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getCartWithItems } from "@/app/actions/cart";
import { getWishlistProductIds } from "@/app/actions/wishlist";
import { useAuth } from "@/components/auth/auth-provider";

interface CartContextType {
  itemCount: number;
  wishlistCount: number;
  wishlistIds: Set<string>;
  refreshCart: () => void;
  refreshWishlist: () => void;
  toggleWishlistId: (productId: string, force?: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  itemCount: 0,
  wishlistCount: 0,
  wishlistIds: new Set(),
  refreshCart: () => {},
  refreshWishlist: () => {},
  toggleWishlistId: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItemCount(0);
      return;
    }
    try {
      const data = await getCartWithItems();
      setItemCount(data.items.reduce((s: number, i: any) => s + i.quantity, 0));
    } catch {
      setItemCount(0);
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const ids = await getWishlistProductIds();
      setWishlistIds(new Set(ids));
    } catch {
      setWishlistIds(new Set());
    }
  }, [user]);

  const toggleWishlistId = useCallback((productId: string, force?: boolean) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      const shouldAdd = force !== undefined ? force : !next.has(productId);
      if (shouldAdd) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [refreshCart, refreshWishlist]);

  return (
    <CartContext.Provider
      value={{
        itemCount,
        wishlistCount: wishlistIds.size,
        wishlistIds,
        refreshCart,
        refreshWishlist,
        toggleWishlistId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
