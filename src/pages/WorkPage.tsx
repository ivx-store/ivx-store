import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { ArrowUpLeft, ExternalLink } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "اشتراكات بلس",
    category: "اشتراكات",
    color: "from-gray-800 to-black",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "أحدث الألعاب",
    category: "ألعاب",
    color: "from-gray-700 to-gray-900",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "حسابات مميزة",
    category: "حسابات",
    color: "from-gray-600 to-gray-800",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "شحن رصيد",
    category: "خدمات",
    color: "from-gray-500 to-gray-700",
    image: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?q=80&w=1000&auto=format&fit=crop",
  }
];

export function WorkPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div className="min-h-screen bg-black text-white pb-32" dir="rtl" ref={containerRef}>
      {/* Header */}
      <div className="pt-20 pb-10 px-6 sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-l from-white to-gray-400"
        >
          منتجاتنا
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mt-2 font-medium"
        >
          تصفح أحدث الألعاب والاشتراكات
        </motion.p>
      </div>

      {/* Projects Stack */}
      <div className="px-4 mt-10 relative">
        {projects.map((project, index) => {
          const targetScale = 1 - ((projects.length - index) * 0.05);
          return (
            <Card 
              key={project.id} 
              project={project} 
              index={index} 
              progress={scrollYProgress} 
              range={[index * 0.25, 1]} 
              targetScale={targetScale} 
            />
          );
        })}
      </div>
    </div>
  );
}

interface Project {
  id: number;
  title: string;
  category: string;
  color: string;
  image: string;
}

interface CardProps {
  key?: React.Key;
  project: Project;
  index: number;
  progress: any;
  range: number[];
  targetScale: number;
}

function Card({ project, index, progress, range, targetScale }: CardProps) {
  const containerRef = useRef(null);
  const scale = useTransform(progress, range, [1, targetScale]);
  const opacity = useTransform(progress, range, [1, 0.5]);

  return (
    <div ref={containerRef} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div 
        style={{ scale, opacity, top: `calc(-10vh + ${index * 25}px)` }}
        className="relative w-full max-w-md h-[70vh] rounded-[2.5rem] overflow-hidden shadow-2xl origin-top border border-gray-800"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-40`}></div>
        <img 
          src={project.image} 
          alt={project.title} 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 grayscale"
        />
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold text-white">
              {project.category}
            </span>
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <ArrowUpLeft className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black text-white mb-4 leading-tight">
              {project.title}
            </h2>
            <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-bold">
              <span>عرض التفاصيل</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
