import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        if (!items.some((i) => i.productId === item.productId)) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      toggleWishlist: (item) => {
        const isPresent = get().isInWishlist(item.productId);
        if (isPresent) {
          get().removeItem(item.productId);
          return false;
        } else {
          get().addItem(item);
          return true;
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((i) => i.productId === productId);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'luxe-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
