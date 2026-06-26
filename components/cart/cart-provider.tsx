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
  refreshCart: () => void;
  refreshWishlist: () => void;
}

const CartContext = createContext<CartContextType>({
  itemCount: 0,
  wishlistCount: 0,
  refreshCart: () => {},
  refreshWishlist: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
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
      setWishlistCount(0);
      return;
    }
    try {
      const ids = await getWishlistProductIds();
      setWishlistCount(ids.length);
    } catch {
      setWishlistCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [refreshCart, refreshWishlist]);

  return (
    <CartContext.Provider
      value={{ itemCount, wishlistCount, refreshCart, refreshWishlist }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
