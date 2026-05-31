export interface CartItem {
  packageId: string;
  packageName: string;
  country: string;
  simType: "esim" | "physical";
  unitPrice: number;
  quantity: number;
}

const CART_KEY = "mifigo_sim_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }
}

export function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
  const cart = readCart();
  const existing = cart.find((c) => c.packageId === item.packageId);
  if (existing) {
    existing.quantity += item.quantity ?? 1;
  } else {
    cart.push({ ...item, quantity: item.quantity ?? 1 });
  }
  writeCart(cart);
  return cart;
}

export function updateCartQuantity(packageId: string, quantity: number) {
  const qty = Math.min(99, Math.max(1, Math.floor(quantity) || 1));
  const cart = readCart();
  const item = cart.find((c) => c.packageId === packageId);
  if (!item) return cart;
  item.quantity = qty;
  writeCart(cart);
  return cart;
}

export function removeFromCart(packageId: string) {
  const cart = readCart().filter((c) => c.packageId !== packageId);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}
