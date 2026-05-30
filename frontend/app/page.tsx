"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { getSession, getMenu, getCategories, getCart } from "@/lib/api";
import MenuGrid from "@/components/MenuGrid";
import CartDrawer from "@/components/CartDrawer";
import ChatDrawer from "@/components/ChatDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import CategoryTabs from "@/components/CategoryTabs";
import { ShoppingCart, MessageCircle, WifiOff, RefreshCw } from "lucide-react";

const TABLE_ID = "T1"; // In production, read from URL: /table/T1

export default function Home() {
  const { setSession, setMenuItems, menuItems, setCart, cartItems,
          cartOpen, setCartOpen, chatOpen, setChatOpen } = useStore();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-dining-backend-li4x.onrender.com";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
    } catch (err: any) {
      console.error("Failed to load initial data", err);
      setError(err.message || "Failed to establish server connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [retryCount]);

  const filtered = menuItems.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin flex items-center justify-center"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🍽️</span>
          </div>
          <h2 className="font-bold text-xl text-gray-800 mb-2">Smart Dining</h2>
          <p className="text-sm text-gray-500 mb-1">Setting up your table ({TABLE_ID})...</p>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed animate-pulse">
            Connecting to server. Free-tier servers may take up to 50 seconds to wake up from sleep mode.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <WifiOff size={24} />
          </div>
          <h2 className="font-bold text-lg text-gray-800 mb-2">Connection Delayed</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            We couldn't connect to our dining server. This usually happens if the server is still booting up from sleep mode.
          </p>
          
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-sm shadow-orange-200"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>

          <div className="mt-6 pt-4 border-t border-gray-100 w-full text-[10px] text-gray-400 text-left overflow-x-auto">
            <p className="font-semibold uppercase tracking-wider mb-1">Connection Details:</p>
            <p className="font-mono bg-gray-50 p-1.5 rounded break-all">{API_URL}</p>
          </div>
        </div>
      </main>
    );
  }

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