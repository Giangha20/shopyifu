'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItemType, CouponItem } from '@/types/store';

interface CartStore {
  items: CartItemType[];
  coupon: CouponItem | null;
  shippingFee: number;
  addItem: (item: CartItemType) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponItem) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      shippingFee: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            const nextQuantity = Math.min(currentItem.quantity + newItem.quantity, currentItem.stock || 99);
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: nextQuantity,
            };
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === id) {
                const safeQty = Math.max(1, Math.min(quantity, item.stock || 99));
                return { ...item, quantity: safeQty };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        }));
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon) return 0;

        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return 0;
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else if (coupon.discountType === 'fixed_amount') {
          discount = coupon.discountValue;
        }
        return Math.min(discount, subtotal);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = subtotal >= 2000000 || subtotal === 0 ? 0 : 40000;
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'luxe_cart_store_v2',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          try {
            // Clean up legacy store key that had the dummy item
            localStorage.removeItem('luxe_cart_store');
          } catch {
            // ignore
          }
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          // Extra safeguard: remove any legacy mock items
          state.items = state.items.filter(
            (item) => item.id !== 'init-cart-1' && item.productId !== 'prod-1'
          );
        }
      },
    }
  )
);
