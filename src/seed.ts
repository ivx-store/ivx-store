/**
 * Seed Script — Upload existing hardcoded data to Firebase
 * Run: npx tsx src/seed.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

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
const db = getFirestore(app);

const services = [
  {
    imageUrl: "https://us.vaio.com/cdn/shop/articles/what_are_the_benefits_of_chat_gpt_plus.jpg?v=1741265012",
    title: "اشتراك ChatGPT Plus",
    description: "اشتراك رسمي لمدة 3 أشهر على حسابك الخاص (ليس عائلي) بسعر 25 ألف دينار فقط.",
    price: "25000",
    currency: "IQD",
    type: "اشتراكات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://sgm.werstreamt.es/production/2024/06/23090222/Streaming-Guide_Netflix_970x546.jpg",
    title: "اشتراك نتفلكس (Netflix)",
    description: "استمتع بأفضل الأفلام والمسلسلات. بروفايل واحد بـ 10 آلاف، أو 5 بروفايلات بـ 15 ألف شهرياً.",
    price: "10000",
    currency: "IQD",
    type: "اشتراكات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://www.vga4a.com/wp-content/uploads/gta-v-bigjpg-e94b8d1280wjpg-e14d62_160w.jpg",
    title: "تهكير حسابات GTA 5",
    description: "شحن فلوس لحسابك في قراند 5. باقات تبدأ من 100 مليون بـ 35 ألف، وتصل إلى 500 مليون.",
    price: "35000",
    currency: "IQD",
    type: "حسابات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://www.vga4a.com/wp-content/uploads/Screenshot-2025-07-16-163500.jpg",
    title: "لعبة FC 26 (فيفا)",
    description: "النسخة الأفضل من فيفا! نوفرها لك بحساب ستيم خاص بك بسعر 45,000 دينار عراقي.",
    price: "45000",
    currency: "IQD",
    type: "ألعاب",
    orderFormFields: [],
  },
  {
    imageUrl: "https://cdn.forza.net/strapi-uploads/assets/FH_5_Evergreen_Key_Art_Horizontal_3840x2160_RGB_337636ab7f.jpg",
    title: "حسابات Forza Horizon",
    description: "سيارات نادرة وفلوس بلا حدود! كل شيء مفتوح من أول دخول لتسيطر على الشوارع.",
    price: "30000",
    currency: "IQD",
    type: "حسابات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://sm.pcmag.com/t/pcmag_mear/news/s/steam-reac/steam-reaches-10-million-concurrent-active-players-for-the-f_pe3q.1920.jpg",
    title: "بكج المدمر (ستيم)",
    description: "أكثر من 27,777 لعبة أصلية من ستيم (غير مكركة). الألعاب تتزايد وتتحدث باستمرار.",
    price: "50000",
    currency: "IQD",
    type: "ألعاب",
    orderFormFields: [],
  },
  {
    imageUrl: "https://www.vga4a.com/wp-content/uploads/pubg-mobile-logo-1.jpg",
    title: "شحن شدات ببجي (UC)",
    description: "شحن سريع وآمن لشدات ببجي بجميع الفئات. أسعار تنافسية مع توصيل فوري.",
    price: "5000",
    currency: "IQD",
    type: "شحن أرصدة",
    orderFormFields: [],
  },
  {
    imageUrl: "https://www.vga4a.com/wp-content/uploads/Screenshot-2025-07-16-163500.jpg",
    title: "نقاط فيفا (FC Points)",
    description: "اشحن نقاط فيفا لفتح باكات واللاعبين الأساطير. أفضل الأسعار في السوق.",
    price: "8000",
    currency: "IQD",
    type: "شحن أرصدة",
    orderFormFields: [],
  },
  {
    imageUrl: "https://sm.pcmag.com/t/pcmag_mear/review/s/sony-plays/sony-playstation-plus_6urt.1920.jpg",
    title: "اشتراك PS Plus شهري",
    description: "العب أونلاين واستمتع بألعاب مجانية كل شهر مع اشتراك بلايستيشن بلس الرسمي.",
    price: "14000",
    currency: "IQD",
    type: "اشتراكات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://sm.pcmag.com/t/pcmag_mear/review/x/xbox-game-/xbox-game-pass_yvnb.1920.jpg",
    title: "اشتراك Xbox Game Pass",
    description: "وصول غير محدود لمئات الألعاب على Xbox و PC. اشتراك التمت مع EA Play.",
    price: "18000",
    currency: "IQD",
    type: "اشتراكات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://www.vga4a.com/wp-content/uploads/gta-v-bigjpg-e94b8d1280wjpg-e14d62_160w.jpg",
    title: "حساب GTA Online مهكر",
    description: "حساب جاهز مع ملايين الدولارات ورتبة عالية وجميع المركبات والعقارات مفتوحة.",
    price: "40000",
    currency: "IQD",
    type: "حسابات",
    orderFormFields: [],
  },
  {
    imageUrl: "https://www.vga4a.com/wp-content/uploads/pubg-mobile-logo-1.jpg",
    title: "جواهر فري فاير",
    description: "شحن جواهر فري فاير بجميع الفئات. تسليم فوري وأسعار لا تُقاوم.",
    price: "3000",
    currency: "IQD",
    type: "شحن أرصدة",
    orderFormFields: [],
  },
];

const packages = [
  {
    title: "باقة الاشتراكات",
    subtitle: "PREMIUM SUBSCRIPTIONS",
    description: "استمتع باللعب أونلاين ومكتبة ألعاب ضخمة مع اشتراكات بلس وجيم باس بأسعار تنافسية.",
    price: "14.99",
    currency: "USD",
    features: ["بلايستيشن بلس (شهر/سنة)", "اكس بوكس جيم باس التمت", "تفعيل رسمي 100%", "دعم فني على مدار الساعة"],
    popular: false,
    bgColor: "#0a1628",
    accentColor: "#3b82f6",
    orderFormFields: [],
  },
  {
    title: "باقة الأسطورة",
    subtitle: "ULTIMATE GAMES ACCOUNT",
    description: "حساب جاهز يضم أقوى وأشهر الألعاب العالمية (GTA V, FC 24, Call of Duty) لتلعب بدون حدود.",
    price: "29.99",
    currency: "USD",
    features: ["أكثر من 20 لعبة مميزة", "ضمان مدى الحياة", "تسليم فوري للحساب", "يدعم بلايستيشن و PC"],
    popular: true,
    bgColor: "#1a1408",
    accentColor: "#f59e0b",
    orderFormFields: [],
  },
  {
    title: "باقة الشحن السريع",
    subtitle: "INSTANT TOP-UPS",
    description: "اشحن حسابك في ثوانٍ! شدات ببجي، فيفا بوينتس، وجواهر فري فاير بأرخص الأسعار.",
    price: "4.99",
    currency: "USD",
    features: ["شحن شدات ببجي (UC)", "نقاط فيفا (FC Points)", "شحن آمن عبر الـ ID", "عروض يومية حصرية"],
    popular: false,
    bgColor: "#0a1f1a",
    accentColor: "#10b981",
    orderFormFields: [],
  },
  {
    title: "باقة الـ VIP",
    subtitle: "VIP EXCLUSIVE",
    description: "الباقة الشاملة للمحترفين. تتضمن حسابات نادرة، اشتراكات سنوية، ورصيد شحن شهري.",
    price: "99.99",
    currency: "USD",
    features: ["حسابات ألعاب نادرة", "اشتراك بلس وجيم باس سنوي", "أولوية في الدعم الفني", "هدايا شهرية مجانية"],
    popular: false,
    bgColor: "#1a0a2e",
    accentColor: "#a855f7",
    orderFormFields: [],
  },
];

const offers = [
  {
    title: "خصم على اشتراك PS Plus سنوي",
    description: "احصل على اشتراك PS Plus سنوي بخصم كبير!",
    originalPrice: "65000",
    discountedPrice: "45000",
    currency: "IQD",
    discount: 30,
    badge: "الأكثر طلباً",
    badgeColor: "#f59e0b",
    gradientFrom: "rgba(59,130,246,0.2)",
    gradientTo: "transparent",
    category: "اشتراكات",
    active: true,
    orderFormFields: [],
  },
  {
    title: "عرض 2×1 على حسابات الألعاب",
    description: "اشترِ حساب واحصل على الثاني مجاناً!",
    originalPrice: "50000",
    discountedPrice: "35000",
    currency: "IQD",
    discount: 50,
    badge: "عرض محدود",
    badgeColor: "#ef4444",
    gradientFrom: "rgba(239,68,68,0.2)",
    gradientTo: "transparent",
    category: "حسابات",
    active: true,
    orderFormFields: [],
  },
  {
    title: "خصم على شحن شدات ببجي 6000 UC",
    description: "اشحن 6000 شدة ببجي بسعر مخفض!",
    originalPrice: "40000",
    discountedPrice: "28000",
    currency: "IQD",
    discount: 30,
    badge: "عرض اليوم",
    badgeColor: "#10b981",
    gradientFrom: "rgba(16,185,129,0.2)",
    gradientTo: "transparent",
    category: "شحن",
    active: true,
    orderFormFields: [],
  },
];

async function seed() {
  console.log("🚀 Starting seed...\n");

  // Check existing data per collection
  const existingServices = await getDocs(collection(db, "services"));
  const existingPackages = await getDocs(collection(db, "packages"));
  const existingOffers = await getDocs(collection(db, "offers"));

  // Seed services (add missing ones by checking titles)
  const existingServiceTitles = new Set(existingServices.docs.map(d => d.data().title));
  const missingServices = services.filter(s => !existingServiceTitles.has(s.title));
  if (missingServices.length > 0) {
    console.log(`📦 Adding ${missingServices.length} missing services...`);
    for (const service of missingServices) {
      await addDoc(collection(db, "services"), {
        ...service,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`   ✅ ${service.title}`);
    }
  } else {
    console.log(`⏭️  All ${services.length} services already exist, skipping.`);
  }

  // Seed packages (only if empty)
  if (existingPackages.size > 0) {
    console.log(`⏭️  Packages: ${existingPackages.size} already exist, skipping.`);
  } else {
    console.log("\n📦 Seeding packages...");
    for (const pkg of packages) {
      await addDoc(collection(db, "packages"), {
        ...pkg,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`   ✅ ${pkg.title}`);
    }
  }

  // Seed offers (only if empty)
  if (existingOffers.size > 0) {
    console.log(`⏭️  Offers: ${existingOffers.size} already exist, skipping.`);
  } else {
    console.log("\n🔥 Seeding offers...");
    for (const offer of offers) {
      await addDoc(collection(db, "offers"), {
        ...offer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`   ✅ ${offer.title}`);
    }
  }

  // Always seed service types (overwrites)
  const { setDoc, doc } = await import("firebase/firestore");
  const types = ["اشتراكات", "ألعاب", "حسابات", "شحن أرصدة"];
  await setDoc(doc(db, "settings", "service_types"), { types });
  console.log("\n⚙️  Service types saved:", types.join(", "));

  console.log("\n\n✅ Seeding complete!");
  console.log("   You can now view and manage everything from the admin panel at /admin\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

