import { create } from 'zustand';
import { useCartStore } from '@/store/useCartStore';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  variantName?: string | null;
  sku?: string;
}

interface CartDrawerStore {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartDrawerStore = create<CartDrawerStore>((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));

export function useCart() {
  const cartStore = useCartStore();
  const drawerStore = useCartDrawerStore();

  return {
    items: cartStore.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      image: item.image,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: item.quantity,
      variantName: item.variantName,
      sku: item.sku,
    })),
    isCartOpen: drawerStore.isCartOpen,
    openCart: drawerStore.openCart,
    closeCart: drawerStore.closeCart,
    toggleCart: drawerStore.toggleCart,
    addItem: (item: any) => {
      cartStore.addItem({
        id: item.id || `${item.productId}-${item.variantId || 'standard'}`,
        productId: item.productId,
        variantId: item.variantId || null,
        name: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
        sku: item.sku || 'LXS-SKU',
        image: item.image,
        price: Number(item.price),
        compareAtPrice: item.compareAtPrice,
        quantity: item.quantity || 1,
        variantName: item.variantName || null,
        stock: item.stock || 99,
      });
      drawerStore.openCart();
    },
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    getTotal: cartStore.getTotal,
    getItemCount: cartStore.getItemCount,
  };
}
