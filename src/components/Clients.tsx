import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { getActiveTestimonials, type TestimonialData } from "../lib/firebase";

const fallbackTestimonials: TestimonialData[] = [
  { name: "أحمد محمد", role: "لاعب محترف", content: "متجر ivx هو الأفضل بلا منازع! أسعار الاشتراكات ممتازة والتسليم فوري. أنصح كل جيمر بالتعامل معهم.", imageUrl: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, order: 1, active: true },
  { name: "سارة خالد", role: "صانعة محتوى", content: "أفضل متجر تعاملت معاه، حسابات مضمونة وخدمة عملاء سريعة ومتعاونة جداً. شكراً ivx!", imageUrl: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5, order: 2, active: true },
  { name: "فهد العتيبي", role: "صاحب متجر ألعاب", content: "نتعامل مع ivx بالجملة منذ فترة، أسعارهم لا تقبل المنافسة والمصداقية عالية جداً. شركاء نجاح حقيقيين.", imageUrl: "https://randomuser.me/api/portraits/men/46.jpg", rating: 5, order: 3, active: true },
  { name: "نورة السعد", role: "لاعبة", content: "تجربة شراء رائعة، حصلت على اللعبة اللي أبيها بسعر خيالي وفي ثواني. متجر موثوق 100%.", imageUrl: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5, order: 4, active: true },
  { name: "عبدالله الراجحي", role: "ستريمر", content: "دايماً أشحن رصيدي من عندهم، سرعة وأمان وأسعار تنافسية. أفضل متجر في العراق بدون شك.", imageUrl: "https://randomuser.me/api/portraits/men/75.jpg", rating: 5, order: 5, active: true },
];

export function Clients() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(fallbackTestimonials);

  useEffect(() => {
    getActiveTestimonials().then(data => {
      if (data.length > 0) setTestimonials(data);
    }).catch(() => {});
  }, []);

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-32 relative overflow-hidden bg-black content-auto" id="clients">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3 hidden md:block" />
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-gray-500/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 hidden md:block" />
      </div>

      <div className="container mx-auto px-4 relative z-10 mb-20">
        <div className="text-center" dir="rtl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            className="text-4xl md:text-5xl font-arabic font-black text-white mb-6 tracking-tight"
          >
            آراء <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">عملائنا</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed"
          >
            نفخر بثقة عملائنا، ونسعد دائماً بأن نكون جزءاً من متعتهم. إليك ما يقولونه عن تجربتهم معنا.
          </motion.p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden py-10" dir="ltr">
        <div className="absolute top-0 left-0 w-24 md:w-64 h-full bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 md:w-64 h-full bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

        <div className="flex gap-8 w-max px-4 marquee-scroll will-change-transform transform-gpu">
          {duplicatedTestimonials.map((item, index) => (
            <div 
              key={index}
              dir="rtl"
              className="relative w-[280px] md:max-w-none md:w-[450px] bg-black rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-[0_10px_40px_rgba(255,255,255,0.04)] border border-gray-800 hover:shadow-[0_20px_60px_rgba(255,255,255,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between group overflow-hidden shrink-0"
            >
              <Quote className="absolute top-4 left-4 w-16 h-16 md:w-24 md:h-24 text-gray-900 opacity-50 group-hover:text-gray-800 group-hover:scale-110 transition-all duration-500 rotate-180 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-3 md:mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 md:w-5 md:h-5 fill-white text-white" />
                  ))}
                </div>
                <p className="text-gray-300 font-arabic text-sm md:text-xl leading-relaxed mb-5 md:mb-8 font-medium">
                  "{item.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-800 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-600 to-gray-400 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="relative w-10 h-10 md:w-16 md:h-16 rounded-full object-cover border-2 border-black"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h4 className="font-black text-white font-arabic text-sm md:text-lg">{item.name}</h4>
                  <p className="text-[10px] md:text-sm text-gray-400 font-bold font-arabic mt-0.5 md:mt-1">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
