import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getActiveFAQs, type FAQData } from '../lib/firebase';

const fallbackFaqs: FAQData[] = [
  { question: "كيف أستلم طلبي بعد الدفع؟", answer: "بعد إتمام عملية الدفع بنجاح، سيتم إرسال تفاصيل طلبك مباشرة إلى بريدك الإلكتروني المسجل، أو عبر رسالة نصية/واتساب حسب وسيلة التواصل التي اخترتها.", order: 1, active: true },
  { question: "هل الحسابات والاشتراكات مضمونة؟", answer: "نعم، جميع منتجاتنا مضمونة 100%. نحن نتعامل مع مصادر موثوقة ونقدم ضماناً كاملاً على جميع الاشتراكات والحسابات طوال فترة الصلاحية المحددة.", order: 2, active: true },
  { question: "ما هي طرق الدفع المتاحة؟", answer: "نوفر طرق دفع متعددة وآمنة تناسب الجميع في العراق، بما في ذلك ماستر كارد، زين كاش، آسيا حوالة، والبطاقات البنكية المعتمدة.", order: 3, active: true },
  { question: "هل يمكنني استرجاع المبلغ إذا واجهت مشكلة؟", answer: "بشكل عام، لا يمكن استرداد المبلغ بعد استلام الطلب. ولكن في حال مواجهة أي مشكلة، يرجى التواصل معنا؛ وسنقوم بدراسة الحالة لمعرفة نوع المشكلة، وبناءً عليها نقرر الإجراء الأنسب.", order: 4, active: true },
  { question: "هل تبيعون بالجملة لأصحاب المتاجر؟", answer: "نعم، بكل تأكيد! نحن نوفر أسعاراً خاصة ومنافسة جداً لطلبات الجملة المخصصة لأصحاب المتاجر وسناتر الألعاب. يمكنك التواصل مع فريق الدعم للحصول على قائمة أسعار الجملة.", order: 5, active: true },
  { question: "متى تكون خدمة العملاء متاحة؟", answer: "فريق خدمة العملاء لدينا متواجد لخدمتكم يومياً خلال ساعات العمل الرسمية: من الساعة 12:00 ظهراً وحتى الساعة 12:00 منتصف الليل.", order: 6, active: true },
];

interface FAQItemProps {
  faq: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, index, isOpen, toggleOpen }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px" }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen 
          ? 'bg-gray-900 border-white/30 shadow-[0_15px_40px_rgba(255,255,255,0.08)]' 
          : 'bg-black border-gray-800 hover:border-white/30 hover:bg-gray-900 hover:shadow-md'
      }`}
    >
      <button
        onClick={toggleOpen}
        className="w-full px-5 py-4 md:px-8 md:py-6 flex items-center justify-between gap-4 text-right focus:outline-none group"
      >
        <span className={`font-bold text-base md:text-xl transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
          {faq.question}
        </span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-white/10 group-hover:text-white'}`}>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, type: "spring", stiffness: 200 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 md:px-8 md:pb-8 text-gray-400 font-medium leading-relaxed text-sm md:text-lg">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-5" />
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQData[]>(fallbackFaqs);

  useEffect(() => {
    getActiveFAQs().then(data => {
      if (data.length > 0) setFaqs(data);
    }).catch(() => {});
  }, []);

  return (
    <section className="py-16 md:py-24 relative bg-black overflow-hidden content-auto" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-gray-500/5 blur-[100px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-white shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-bold">استفسارات شائعة</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6"
          >
            أسئلة <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">شائعة</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto"
          >
            نجيب على استفساراتك الأكثر تكراراً بكل شفافية ووضوح.
          </motion.p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={faq.id || index} 
              faq={faq} 
              index={index} 
              isOpen={openIndex === index} 
              toggleOpen={() => setOpenIndex(openIndex === index ? null : index)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}