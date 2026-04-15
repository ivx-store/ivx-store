import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Home, Compass, ArrowRight } from "lucide-react";
import { PageLayout } from "../components/PageLayout";

export function NotFoundPage() {
  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black text-white px-4">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-ivx-primary/20 rounded-full blur-[100px] opacity-50 mix-blend-screen" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-ivx-secondary/10 rounded-full blur-[120px] opacity-50 mix-blend-screen" />
          
          <motion.div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
            animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
          
          {/* Animated 404 Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <motion.h1 
              className="text-[150px] md:text-[250px] font-black leading-none tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #666666 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={{ 
                textShadow: [
                  "0px 0px 20px rgba(255,255,255,0)",
                  "0px 0px 40px rgba(255,255,255,0.1)",
                  "0px 0px 20px rgba(255,255,255,0)"
                ] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              404
            </motion.h1>
            
            {/* Orbiting element */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Compass size={300} strokeWidth={0.5} className="md:w-[400px] md:h-[400px]" />
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-8 space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              عذراً، الصفحة غير موجودة
            </h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              يبدو أنك ضللت الطريق. الصفحة التي تبحث عنها قد تكون نقلت، حذفت، أو لم تكن موجودة من الأساس. دعنا نعود بك إلى الصفحة الرئيسية.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-12"
          >
            <Link
              to="/"
              className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <Home size={22} className="relative z-10" />
              <span className="relative z-10">العودة للرئيسية</span>
              <motion.div 
                className="relative z-10"
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </Link>
          </motion.div>
          
        </div>
      </div>
    </PageLayout>
  );
}
