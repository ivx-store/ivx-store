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

// ============ Types ============

export interface FormField {
  id: string;
  type: "text" | "email" | "number" | "counter" | "slider" | "textarea" | "select";
  label: string;
  placeholder?: string;
  required: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
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
  return addDoc(collection(db, "orders"), {
    ...data,
    createdAt: serverTimestamp(),
  });
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

// ============ Utility ============

export function generateFieldId(): string {
  return "field_" + Math.random().toString(36).substring(2, 9);
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
