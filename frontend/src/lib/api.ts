import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

// Session
export const getSession = (tableId: string) =>
  api.get(`/api/session/${tableId}`).then(r => r.data);

// Menu
export const getMenu = () =>
  api.get("/api/menu/").then(r => r.data);

export const getCategories = () =>
  api.get("/api/menu/categories").then(r => r.data);

// Cart
export const getCart = (sessionId: string) =>
  api.get(`/api/cart/${sessionId}`).then(r => r.data);

export const addToCart = (sessionId: string, itemId: string, qty = 1, addedBy = "guest") =>
  api.post(`/api/cart/${sessionId}`, { item_id: itemId, quantity: qty, added_by: addedBy }).then(r => r.data);

export const removeFromCart = (sessionId: string, cartItemId: string) =>
  api.delete(`/api/cart/${sessionId}/${cartItemId}`).then(r => r.data);

// AI
export const sendChat = (message: string, sessionId: string, tableId: string) =>
  api.post("/api/ai/chat", { message, session_id: sessionId, table_id: tableId }).then(r => r.data);

// Orders
export const sendOtp = (phone: string) =>
  api.post(`/api/orders/otp/send?phone=${phone}`).then(r => r.data);

export const verifyOtp = (phone: string, otp: string) =>
  api.post(`/api/orders/otp/verify?phone=${phone}&otp=${otp}`).then(r => r.data);

export const placeOrder = (sessionId: string, name: string, phone: string) =>
  api.post(`/api/orders/${sessionId}/place`, { customer_name: name, customer_phone: phone }).then(r => r.data);