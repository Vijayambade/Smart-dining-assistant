"use client";
import { useStore } from "@/store/useStore";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { removeFromCart, getCart } from "@/lib/api";

interface Props {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: Props) {
  const { cartOpen, setCartOpen, cartItems, cartTotal, cartTax, sessionId, setCart } = useStore();

  const handleRemove = async (cartItemId: string) => {
    await removeFromCart(sessionId, cartItemId);
    const cart = await getCart(sessionId);
    setCart(cart.items, cart.total, cart.tax);
  };

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl
          flex flex-col transition-transform duration-300
          ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-orange-500" />
            <h2 className="font-bold text-lg">Your Cart</h2>
          </div>
          <button onClick={() => setCartOpen(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
              <p className="text-sm mt-1">Ask Zara for suggestions!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    ₹{item.price} × {item.quantity}
                  </p>
                  {item.added_by !== "guest" && (
                    <p className="text-xs text-orange-400 mt-0.5">Added by {item.added_by}</p>
                  )}
                </div>
                <span className="font-semibold text-sm">₹{item.subtotal}</span>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>GST (5%)</span>
              <span>₹{cartTax}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>₹{(cartTotal + cartTax).toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}