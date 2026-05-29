"use client";
import { MenuItem, useStore } from "@/store/useStore";
import { addToCart, getCart } from "@/lib/api";
import { ShoppingCart, Star } from "lucide-react";

interface Props {
  items: MenuItem[];
}

export default function MenuGrid({ items }: Props) {
  const { sessionId, setCart, setCartOpen } = useStore();

  const handleAdd = async (item: MenuItem) => {
    if (!sessionId) return;
    await addToCart(sessionId, item.id, 1, "guest");
    const cart = await getCart(sessionId);
    setCart(cart.items, cart.total, cart.tax);
    setCartOpen(true);
    setTimeout(() => setCartOpen(false), 1500);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No items found</p>
        <p className="text-sm mt-1">Try a different filter or ask Zara!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          {/* Image placeholder */}
          <div className="h-36 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-4xl">
            {getCategoryEmoji(item.category)}
          </div>

          <div className="p-4 flex flex-col gap-2 flex-1">
            {/* Tags */}
            <div className="flex gap-1 flex-wrap">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
              {item.popular_score > 0.8 && (
                <Star size={14} className="text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
              )}
            </div>

            <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>

            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="font-bold text-gray-900">₹{item.price}</span>
              {item.available ? (
                <button
                  onClick={() => handleAdd(item)}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-xl transition-colors"
                >
                  <ShoppingCart size={14} />
                  Add
                </button>
              ) : (
                <span className="text-xs text-gray-400">Unavailable</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Veg Starters": "🥗",
    "Non-Veg Starters": "🍗",
    "Mains (Veg)": "🍛",
    "Mains (Non-Veg)": "🍖",
    "Breads & Rice": "🍞",
    "Desserts": "🍮",
    "Beverages (Hot)": "☕",
    "Beverages (Cold)": "🧋",
    "Combos & Deals": "🎁",
  };
  return map[category] || "🍽️";
}