import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzBeT9hiUnPetSZn7k_USicWj8W83W8rY",
  authDomain: "ivx-store.firebaseapp.com",
  projectId: "ivx-store",
  storageBucket: "ivx-store.firebasestorage.app",
  messagingSenderId: "215644092581",
  appId: "1:215644092581:web:8fd6b63c288264ede7754c",
  measurementId: "G-VJNRZH532T",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ============ Auth Helpers ============

export async function loginAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerUser(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logoutAdmin() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };

// ============ Users & Guests CRUD ============

export interface SiteUser {
  uid: string;
  email: string | null;
  isBanned: boolean;
  lastSeen: Timestamp | null;
  createdAt?: Timestamp;
}

export interface GuestSession {
  id: string;
  lastSeen: Timestamp | null;
}

export async function updateUserPresence(uid: string, email: string | null) {
  const docRef = doc(db, "users", uid);
  return setDoc(docRef, {
    uid,
    email,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

export async function updateGuestPresence(guestId: string) {
  const docRef = doc(db, "guests", guestId);
  return setDoc(docRef, {
    id: guestId,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

export async function checkUserBanned(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists() && snap.data().isBanned === true) {
    return true;
  }
  return false;
}

export async function toggleUserBan(uid: string, isBanned: boolean) {
  const docRef = doc(db, "users", uid);
  return updateDoc(docRef, { isBanned });
}

export async function getAllUsers(): Promise<SiteUser[]> {
  const q = query(collection(db, "users"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return { ...data, uid: d.id } as SiteUser;
  });
}

export async function getAllGuests(): Promise<GuestSession[]> {
  const q = query(collection(db, "guests"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as GuestSession);
}

// ============ Constants ============

/** Admin UID — only this user can access the admin panel */
export const ADMIN_UID = "1kxnlTP7AlZvFwc82E546aNFX8j2";

// ============ Types ============

export interface FormField {
  id: string;
  type: "text" | "email" | "number" | "counter" | "slider" | "textarea" | "select" | "tel";
  label: string;
  placeholder?: string;
  required: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  system?: boolean;
  deleted?: boolean;
  // === Dynamic Pricing ===
  pricingEnabled?: boolean;
  pricingMode?: "fixed" | "per_unit" | "options_map";
  fixedPrice?: number;
  pricePerUnit?: number;
  optionPrices?: Record<string, number>;
  priceCurrency?: Currency;
}

export function ensureSystemFields(fields: FormField[] = []): FormField[] {
  let updated = [...fields];
  if (!updated.some(f => f.id === "customerName")) {
    updated = [{ id: "customerName", type: "text", label: "الاسم الكريم", placeholder: "اكتب اسمك هنا...", required: true, system: true }, ...updated];
  }
  if (!updated.some(f => f.id === "customerPhone")) {
    const defaultIdx = updated.length > 0 ? 1 : 0;
    updated.splice(defaultIdx, 0, { id: "customerPhone", type: "tel", label: "رقم الجوال", placeholder: "07X XXXX XXXX", required: true, system: true });
  }
  if (!updated.some(f => f.id === "customerNotes")) {
    updated = [...updated, { id: "customerNotes", type: "textarea", label: "تفاصيل إضافية (اختياري)", placeholder: "أي تفاصيل أخرى تود إضافتها...", required: false, system: true }];
  }
  return updated;
}

export type Currency = "USD" | "IQD";

export interface ServiceData {
  id?: string;
  imageUrl: string;
  title: string;
  description: string;
  price: string;
  currency: Currency;
  type: string;
  platform?: string;
  orderFormFields: FormField[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PackageData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  currency: Currency;
  features: string[];
  popular: boolean;
  bgColor?: string;       // e.g. "#1a1a2e" or gradient "linear-gradient(135deg, #1a1a2e, #16213e)"
  accentColor?: string;    // e.g. "#e94560" for buttons/badges
  orderFormFields: FormField[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OfferData {
  id?: string;
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  currency: Currency;
  discount: number;          // percentage e.g. 30
  badge: string;             // e.g. "الأكثر طلباً", "عرض محدود"
  badgeColor: string;        // e.g. "#f59e0b", "#ef4444"
  gradientFrom: string;      // gradient start color
  gradientTo: string;        // gradient end color
  category: string;          // e.g. "اشتراكات", "حسابات"
  imageUrl?: string;         // offer image URL
  countdownEnabled?: boolean; // enable/disable countdown timer
  countdownDays?: number;     // countdown days
  countdownHours?: number;    // countdown hours
  countdownMinutes?: number;  // countdown minutes
  endsAt?: Timestamp;        // expiry date
  active: boolean;
  orderFormFields: FormField[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SiteSettings {
  whatsappNumber: string;
  email: string;
  instagramUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  telegramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
}

export interface OrderData {
  id?: string;
  itemTitle: string;
  itemType: "service" | "package" | "offer";
  customerName: string;
  customerPhone: string;
  customerNotes: string;
  customFields: Record<string, any>;
  status: "pending" | "processing" | "completed" | "cancelled";
  userId?: string;
  userEmail?: string;
  userRegisteredEmail?: string;
  totalPrice?: number;
  priceCurrency?: Currency;
  pricingBreakdown?: { label: string; value: number }[];
  createdAt?: Timestamp;
}

export interface MessageData {
  id?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: Timestamp;
}

// ============ Services CRUD ============

export async function getServices(): Promise<ServiceData[]> {
  const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceData));
}

export async function getService(id: string): Promise<ServiceData | null> {
  const snap = await getDoc(doc(db, "services", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ServiceData;
}

export async function addService(data: Omit<ServiceData, "id" | "createdAt" | "updatedAt">) {
  return addDoc(collection(db, "services"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateService(id: string, data: Partial<ServiceData>) {
  const { id: _id, createdAt, ...rest } = data as any;
  return updateDoc(doc(db, "services", id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(id: string) {
  return deleteDoc(doc(db, "services", id));
}

// ============ Packages CRUD ============

export async function getPackages(): Promise<PackageData[]> {
  const q = query(collection(db, "packages"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PackageData));
}

export async function getPackage(id: string): Promise<PackageData | null> {
  const snap = await getDoc(doc(db, "packages", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PackageData;
}

export async function addPackage(data: Omit<PackageData, "id" | "createdAt" | "updatedAt">) {
  return addDoc(collection(db, "packages"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePackage(id: string, data: Partial<PackageData>) {
  const { id: _id, createdAt, ...rest } = data as any;
  return updateDoc(doc(db, "packages", id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePackage(id: string) {
  return deleteDoc(doc(db, "packages", id));
}

// ============ Offers CRUD ============

export async function getOffers(): Promise<OfferData[]> {
  const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OfferData));
}

export async function getActiveOffers(): Promise<OfferData[]> {
  try {
    // Try compound query first (requires Firestore composite index)
    const q = query(collection(db, "offers"), where("active", "==", true), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OfferData));
  } catch (err) {
    // Fallback: fetch all offers and filter client-side if composite index is missing
    console.warn("Composite index not available, falling back to client-side filtering", err);
    const allOffers = await getOffers();
    return allOffers.filter((o) => o.active);
  }
}

export async function getOffer(id: string): Promise<OfferData | null> {
  const snap = await getDoc(doc(db, "offers", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as OfferData;
}

export async function addOffer(data: Omit<OfferData, "id" | "createdAt" | "updatedAt">) {
  return addDoc(collection(db, "offers"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateOffer(id: string, data: Partial<OfferData>) {
  const { id: _id, createdAt, ...rest } = data as any;
  return updateDoc(doc(db, "offers", id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOffer(id: string) {
  return deleteDoc(doc(db, "offers", id));
}

// ============ Orders CRUD ============

export async function getOrders(): Promise<OrderData[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderData));
}

export async function addOrder(data: Omit<OrderData, "id" | "createdAt">) {
  const currentUser = auth.currentUser;
  return addDoc(collection(db, "orders"), {
    ...data,
    userId: currentUser?.uid || "",
    userRegisteredEmail: currentUser?.email || "",
    createdAt: serverTimestamp(),
  });
}

export async function getUserOrders(userId: string): Promise<OrderData[]> {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderData));
  } catch (err) {
    // Fallback if composite index is missing
    console.warn("Composite index not available for user orders, falling back", err);
    const allOrders = await getOrders();
    return allOrders.filter((o) => o.userId === userId);
  }
}

export async function updateOrderStatus(id: string, status: OrderData["status"]) {
  return updateDoc(doc(db, "orders", id), { status });
}

export async function deleteOrder(id: string) {
  return deleteDoc(doc(db, "orders", id));
}

// ============ Messages CRUD ============

export async function getMessages(): Promise<MessageData[]> {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MessageData));
}

export async function addMessage(data: Omit<MessageData, "id" | "createdAt" | "read">) {
  return addDoc(collection(db, "messages"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function markMessageRead(id: string, read: boolean) {
  return updateDoc(doc(db, "messages", id), { read });
}

export async function deleteMessage(id: string) {
  return deleteDoc(doc(db, "messages", id));
}

// ============ Site Settings ============

const defaultSettings: SiteSettings = {
  whatsappNumber: "",
  email: "",
  instagramUrl: "",
  twitterUrl: "",
  tiktokUrl: "",
  telegramUrl: "",
  heroTitle: "IVX Store",
  heroSubtitle: "متجرك الأول للألعاب والاشتراكات",
  aboutText: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const snap = await getDoc(doc(db, "settings", "general"));
  if (!snap.exists()) return defaultSettings;
  return { ...defaultSettings, ...snap.data() } as SiteSettings;
}

export async function saveSettings(data: Partial<SiteSettings>) {
  return setDoc(doc(db, "settings", "general"), data, { merge: true });
}

// ============ Service Types CRUD ============

export async function getServiceTypes(): Promise<string[]> {
  const snap = await getDoc(doc(db, "settings", "service_types"));
  if (!snap.exists()) return [];
  return (snap.data()?.types as string[]) || [];
}

export async function saveServiceTypes(types: string[]) {
  return setDoc(doc(db, "settings", "service_types"), { types });
}

// ============ Platform Types CRUD ============

export async function getPlatformTypes(): Promise<string[]> {
  const snap = await getDoc(doc(db, "settings", "platform_types"));
  if (!snap.exists()) return [];
  return (snap.data()?.types as string[]) || [];
}

export async function savePlatformTypes(types: string[]) {
  return setDoc(doc(db, "settings", "platform_types"), { types });
}

// ============ Cart CRUD ============

export interface CartItem {
  id?: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  servicePrice: number;
  serviceCurrency: Currency;
  serviceType?: string;
  platform?: string;
  quantity: number;
  addedAt?: Timestamp;
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const q = query(collection(db, "carts", userId, "items"), orderBy("addedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CartItem));
  } catch {
    const q = query(collection(db, "carts", userId, "items"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CartItem));
  }
}

export async function addToCart(userId: string, item: Omit<CartItem, "id" | "addedAt">) {
  // Use serviceId as the document ID to avoid duplicates and eliminate read-before-write
  const docRef = doc(db, "carts", userId, "items", item.serviceId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const existingQty = snap.data()?.quantity || 0;
    return updateDoc(docRef, {
      quantity: existingQty + item.quantity,
    });
  }
  // Sanitize: Firestore rejects undefined field values — replace with defaults
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(item)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  // Ensure required string fields have defaults
  if (!sanitized.platform) sanitized.platform = "";
  if (!sanitized.serviceType) sanitized.serviceType = "";
  if (!sanitized.serviceImage) sanitized.serviceImage = "";

  return setDoc(docRef, {
    ...sanitized,
    addedAt: serverTimestamp(),
  });
}

export async function removeFromCart(userId: string, cartItemId: string) {
  return deleteDoc(doc(db, "carts", userId, "items", cartItemId));
}

export async function updateCartItemQty(userId: string, cartItemId: string, quantity: number) {
  return updateDoc(doc(db, "carts", userId, "items", cartItemId), { quantity });
}

export async function clearCart(userId: string) {
  const items = await getCartItems(userId);
  const deletes = items.map(item => {
    if (item.id) return deleteDoc(doc(db, "carts", userId, "items", item.id));
    return Promise.resolve();
  });
  await Promise.all(deletes);
}

export async function checkoutCart(userId: string, userName: string, userEmail: string) {
  const items = await getCartItems(userId);
  if (items.length === 0) throw new Error("Cart is empty");

  const totalPrice = items.reduce((sum, item) => sum + (item.servicePrice * item.quantity), 0);
  const currency = items[0].serviceCurrency;

  const breakdown = items.map(item => ({
    label: item.quantity > 1 ? `${item.serviceTitle} × ${item.quantity}` : item.serviceTitle,
    value: item.servicePrice * item.quantity,
  }));

  const itemTitles = items.map(i => i.serviceTitle).join("، ");

  await addOrder({
    itemTitle: `سلة ${userName || userEmail}`,
    itemType: "service",
    customerName: userName,
    customerPhone: "",
    customerNotes: `عناصر السلة: ${itemTitles}`,
    customFields: {
      cartItems: items.map(i => ({
        title: i.serviceTitle,
        price: i.servicePrice,
        currency: i.serviceCurrency,
        quantity: i.quantity,
        platform: i.platform || "",
      })),
    },
    status: "pending",
    totalPrice,
    priceCurrency: currency,
    pricingBreakdown: breakdown,
  });

  // Clear cart after checkout
  await clearCart(userId);
}

// ============ Utility ============

export function generateFieldId(): string {
  return "field_" + Math.random().toString(36).substring(2, 9);
}

/** Shared date formatter — English locale for clear readability */
export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPriceWithCommas(value: string): string {
  // Remove non-digit characters except dot
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  // Add commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function stripCommas(value: string): string {
  return value.replace(/,/g, "");
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === "USD" ? "$" : "د.ع";
}

export function formatDisplayPrice(price: string, currency: Currency): string {
  if (!price) return "";
  const formatted = formatPriceWithCommas(price);
  return currency === "USD" ? `$${formatted}` : `${formatted} د.ع`;
}

// ============ Color Presets ============

export const PACKAGE_COLOR_PRESETS = [
  { name: "أسود كلاسيكي", bg: "#000000", accent: "#ffffff" },
  { name: "أزرق ملكي", bg: "#0a1628", accent: "#3b82f6" },
  { name: "أرجواني فاخر", bg: "#1a0a2e", accent: "#a855f7" },
  { name: "أخضر زمردي", bg: "#0a1f1a", accent: "#10b981" },
  { name: "ذهبي مميز", bg: "#1a1408", accent: "#f59e0b" },
  { name: "أحمر جريء", bg: "#1f0a0a", accent: "#ef4444" },
  { name: "وردي أنيق", bg: "#1f0a1a", accent: "#ec4899" },
  { name: "سماوي هادئ", bg: "#0a1a1f", accent: "#06b6d4" },
];

export const OFFER_BADGE_PRESETS = [
  { label: "الأكثر طلباً", color: "#f59e0b" },
  { label: "عرض محدود", color: "#ef4444" },
  { label: "عرض اليوم", color: "#10b981" },
  { label: "حصري", color: "#8b5cf6" },
  { label: "تخفيض كبير", color: "#f97316" },
  { label: "جديد", color: "#3b82f6" },
];
