export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  designId?: string;
  productName: string;
  variantLabel: string;
  previewUrl: string;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}
