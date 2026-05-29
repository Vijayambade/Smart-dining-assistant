"use client";
import { useState } from "react";
import { sendOtp, verifyOtp, placeOrder } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { X, CheckCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ open, onClose }: Props) {
  const { sessionId, cartTotal, cartTax, setCart } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [order, setOrder] = useState<{ order_id: string; estimated_wait: string; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSendOtp = async () => {
    if (!name || !phone) { setError("Please fill in your name and phone."); return; }
    setLoading(true); setError("");
    await sendOtp(phone);
    setStep("otp");
    setLoading(false);
  };

  const handleVerifyAndOrder = async () => {
    if (!otp) { setError("Please enter the OTP."); return; }
    setLoading(true); setError("");
    const verified = await verifyOtp(phone, otp);
    if (!verified.verified) { setError("Wrong OTP. Try again (hint: 123456 in demo mode)."); setLoading(false); return; }
    const result = await placeOrder(sessionId, name, phone);
    setOrder(result);
    setCart([], 0, 0);
    setStep("success");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-xl">
            {step === "details" && "Place Your Order"}
            {step === "otp" && "Verify Phone"}
            {step === "success" && "Order Placed! 🎉"}
          </h2>
          {step !== "success" && <button onClick={onClose}><X size={20} /></button>}
        </div>

        {step === "details" && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-3 flex justify-between text-sm">
              <span className="text-gray-500">Total (incl. GST)</span>
              <span className="font-bold">₹{(cartTotal + cartTax).toFixed(2)}</span>
            </div>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="Phone number" type="tel" className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleSendOtp} disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">OTP sent to {phone}. In demo mode, use <strong>123456</strong>.</p>
            <input value={otp} onChange={e => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP" className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 tracking-widest text-center text-lg" maxLength={6} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleVerifyAndOrder} disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
              {loading ? "Verifying..." : "Confirm Order"}
            </button>
          </div>
        )}

        {step === "success" && order && (
          <div className="space-y-4 text-center">
            <CheckCircle size={56} className="mx-auto text-green-500" />
            <p className="text-gray-600 text-sm">Order <span className="font-mono font-bold">{order.order_id.slice(0, 8)}</span> confirmed!</p>
            <div className="bg-green-50 rounded-xl p-4 text-left space-y-1">
              <p className="text-sm text-gray-600">Estimated wait: <strong>{order.estimated_wait}</strong></p>
              <p className="text-sm text-gray-600">Total paid: <strong>₹{order.total}</strong></p>
            </div>
            <button onClick={onClose} className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}