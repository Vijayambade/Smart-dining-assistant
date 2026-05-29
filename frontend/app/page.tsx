"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { getSession, getMenu, getCategories, getCart } from "@/lib/api";
import MenuGrid from "@/components/MenuGrid";
import CartDrawer from "@/components/CartDrawer";
import ChatDrawer from "@/components/ChatDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import CategoryTabs from "@/components/CategoryTabs";
import { ShoppingCart, MessageCircle } from "lucide-react";

const TABLE_ID = "T1"; // In production, read from URL: /table/T1

export default function Home() {
  const { setSession, setMenuItems, menuItems, setCart, cartItems,
          cartOpen, setCartOpen, chatOpen, setChatOpen } = useStore();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession(TABLE_ID);
      setSession(session.id, TABLE_ID);
      const [menu, cats, cart] = await Promise.all([
        getMenu(),
        getCategories(),
        getCart(session.id),
      ]);
      setMenuItems(menu);
      setCategories(cats);
      setCart(cart.items, cart.total, cart.tax);
    })();
  }, []);

  const filtered = menuItems.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-gray-900">🍽 Smart Dining</h1>
            <p className="text-xs text-gray-400">Table {TABLE_ID}</p>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative p-2">
            <ShoppingCart size={22} className="text-gray-700" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 max-w-2xl mx-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none"
          />
        </div>

        {/* Category tabs */}
        <div className="px-4 pb-3 max-w-2xl mx-auto">
          <CategoryTabs categories={categories} active={activeCategory} onChange={setActiveCategory} />
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <p className="text-sm text-gray-400 mb-3">{filtered.length} items</p>
        <MenuGrid items={filtered} />
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-30 flex items-center gap-2"
      >
        <MessageCircle size={22} />
        <span className="text-sm font-semibold pr-1">Ask Zara</span>
      </button>

      {/* Drawers & Modals */}
      <CartDrawer onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <ChatDrawer />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </main>
  );
}