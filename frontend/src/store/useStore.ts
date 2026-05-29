import { create } from "zustand";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  tags: string[];
  allergens: string[];
  available: boolean;
  popular_score: number;
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  added_by: string;
  special_instructions: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
  upsell?: UpsellItem;
}

export interface Suggestion {
  itemId: string;
  name: string;
  price: number;
  reason: string;
}

export interface UpsellItem {
  message: string;
  upsell_item: { itemId: string; name: string; price: number } | null;
}

interface Store {
  // Session
  sessionId: string;
  tableId: string;
  setSession: (sessionId: string, tableId: string) => void;

  // Menu
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;

  // Cart
  cartItems: CartItem[];
  cartTotal: number;
  cartTax: number;
  setCart: (items: CartItem[], total: number, tax: number) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  // UI
  cartOpen: boolean;
  chatOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  sessionId: "",
  tableId: "",
  setSession: (sessionId, tableId) => set({ sessionId, tableId }),

  menuItems: [],
  setMenuItems: (items) => set({ menuItems: items }),

  cartItems: [],
  cartTotal: 0,
  cartTax: 0,
  setCart: (items, total, tax) => set({ cartItems: items, cartTotal: total, cartTax: tax }),

  messages: [
    {
      role: "assistant",
      content: "Hey! I'm Zara 👋 What are you in the mood for today? Tell me and I'll find you something great!",
    },
  ],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  cartOpen: false,
  chatOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  setChatOpen: (v) => set({ chatOpen: v }),
}));