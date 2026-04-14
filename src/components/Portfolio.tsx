import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Maximize2 } from 'lucide-react';

const categories = ['الكل', 'ألعاب', 'اشتراكات', 'حسابات'];

const projects = [
  { 
    id: 1, 
    title: 'حسابات بلايستيشن جاهزة', 
    category: 'حسابات', 
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop',
    span: 'md:col-span-2 md:row-span-2'
  },
  { 
    id: 2, 
    title: 'اشتراكات جيم باس التمت', 
    category: 'اشتراكات', 
    image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-1'
  },
  { 
    id: 3, 
    title: 'أحدث الألعاب الرقمية', 
    category: 'ألعاب', 
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-1'
  },
  { 
    id: 4, 
    title: 'حسابات اكس بوكس', 
    category: 'حسابات', 
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=800&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-2'
  },
  { 
    id: 5, 
    title: 'اشتراكات بلس', 
    category: 'اشتراكات', 
    image: 'https://images.unsplash.com/photo-1507457379470-08b800bebc67?q=80&w=800&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-1'
  },
  { 
    id: 6, 
    title: 'ألعاب بي سي', 
    category: 'ألعاب', 
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-1'
  },
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('الكل');

  const filteredProjects = projects.filter(project => 
    activeCategory === 'الكل' ? true : project.category === activeCategory
  );

  return (
    <section className="py-32 relative z-10 bg-black" id="portfolio">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" dir="rtl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-arabic font-black text-white mb-6 tracking-tight"
          >
            معرض <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">منتجاتنا</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-arabic max-w-2xl mx-auto font-medium leading-relaxed mb-12"
          >
            تصفح مجموعة من أفضل الألعاب والاشتراكات والحسابات المتوفرة لدينا.
          </motion.p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full font-arabic font-bold text-sm md:text-base transition-all duration-300 hover-trigger ${
                  activeCategory === category 
                    ? 'bg-white text-black shadow-lg shadow-white/30 scale-105' 
                    : 'bg-black text-gray-400 hover:bg-gray-900 border border-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]"
          dir="rtl"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className={`relative rounded-3xl overflow-hidden group hover-trigger ${activeCategory === 'الكل' ? project.span : 'col-span-1 row-span-1'}`}
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <span className="inline-block px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full font-arabic mb-3">
                      {project.category}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white font-arabic mb-2">{project.title}</h3>
                    <div className="flex gap-3 mt-4">
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <ExternalLink size={18} />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <Maximize2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
