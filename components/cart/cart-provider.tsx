"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getCartWithItems } from "@/app/actions/cart";
import { useAuth } from "@/components/auth/auth-provider";

interface CartContextType {
  itemCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({
  itemCount: 0,
  refreshCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
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

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
