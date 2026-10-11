'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductItem } from '@/types/store';

interface WishlistStore {
  items: ProductItem[];
  addItem: (product: ProductItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: ProductItem) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) return state;
          return { items: [...state.items, product] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      toggleWishlist: (product) => {
        const inWishlist = get().isInWishlist(product.id);
        if (inWishlist) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'luxe_wishlist_store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
