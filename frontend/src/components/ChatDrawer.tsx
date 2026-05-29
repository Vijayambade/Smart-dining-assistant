"use client";
import { useState, useRef, useEffect } from "react";
import { useStore, Suggestion } from "@/store/useStore";
import { sendChat, addToCart, getCart } from "@/lib/api";
import { X, Send, ShoppingCart } from "lucide-react";

const QUICK_PROMPTS = [
  { label: "🌶 Spicy", msg: "something spicy" },
  { label: "🥗 Light", msg: "something light" },
  { label: "🍽 Filling", msg: "something filling" },
  { label: "🍰 Dessert", msg: "show me desserts" },
  { label: "🍹 Drinks", msg: "what drinks do you have" },
  { label: "⭐ Best Sellers", msg: "what's popular" },
];

export default function ChatDrawer() {
  const { chatOpen, setChatOpen, messages, addMessage, sessionId, tableId, setCart } = useStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || !sessionId) return;
    addMessage({ role: "user", content: text });
    setInput("");
    setLoading(true);
    try {
      const res = await sendChat(text, sessionId, tableId);
      addMessage({
        role: "assistant",
        content: res.message || "Here are some options for you!",
        suggestions: res.suggestions || [],
        upsell: res.upsell || null,
      });
    } catch {
      addMessage({ role: "assistant", content: "Sorry, I had trouble connecting. Try again!" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromChat = async (itemId: string) => {
    await addToCart(sessionId, itemId, 1, "guest");
    const cart = await getCart(sessionId);
    setCart(cart.items, cart.total, cart.tax);
  };

  return (
    <>
      {chatOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setChatOpen(false)} />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 h-[85vh] bg-white z-50 rounded-t-3xl shadow-2xl
          flex flex-col transition-transform duration-300
          ${chatOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              Z
            </div>
            <div>
              <p className="font-bold text-sm">Zara</p>
              <p className="text-xs text-green-500">Online • Your dining assistant</p>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] space-y-2">
                {/* Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}
                >
                  {msg.content}
                </div>

                {/* Suggestion cards */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="space-y-2">
                    {msg.suggestions.map((s: Suggestion) => (
                      <div key={s.itemId} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.reason}</p>
                          <p className="text-orange-500 font-semibold text-sm mt-1">₹{s.price}</p>
                        </div>
                        <button
                          onClick={() => handleAddFromChat(s.itemId)}
                          className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition-colors shrink-0"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upsell card */}
                {msg.upsell && msg.upsell.upsell_item && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs text-amber-700 mb-2">{msg.upsell.message}</p>
                    <button
                      onClick={() => handleAddFromChat(msg.upsell!.upsell_item!.itemId)}
                      className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium"
                    >
                      Add {msg.upsell.upsell_item.name} — ₹{msg.upsell.upsell_item.price}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.msg)}
              className="whitespace-nowrap text-xs px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200 font-medium hover:bg-orange-100 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Zara anything..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}