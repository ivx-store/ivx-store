import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", sales: 15, users: 10 },
  { month: "Feb", sales: 25, users: 18 },
  { month: "Mar", sales: 40, users: 30 },
  { month: "Apr", sales: 65, users: 45 },
  { month: "May", sales: 90, users: 65 },
  { month: "Jun", sales: 120, users: 85 },
  { month: "Jul", sales: 150, users: 100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
        className="bg-black/90 backdrop-blur-xl border border-gray-800 shadow-[0_10px_40px_rgba(255,255,255,0.1)] p-4 rounded-2xl"
        dir="rtl"
      >
        <p className="font-bold text-white mb-3 text-lg border-b border-gray-800 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mb-2 last:mb-0">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-400 font-medium text-sm">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

export function DataSection() {
  const chartRef = useRef(null);
  const isChartInView = useInView(chartRef, { once: true, margin: "-100px" });

  return (
    <section className="py-16 md:py-24 relative z-10 bg-black border-y border-gray-800 shadow-[0_0_50px_rgba(255,255,255,0.02)] overflow-hidden content-auto">
      <div className="container mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          
          {/* Left: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-1 space-y-6 text-right" 
            dir="rtl"
          >
            <h2 className="text-2xl md:text-4xl font-arabic font-bold text-white">
              أرقام تتحدث <span className="text-gray-400 block mt-2 text-lg md:text-2xl">(Our Growth)</span>
            </h2>
            <p className="text-gray-400 font-arabic leading-relaxed font-medium text-sm md:text-base">
              نحن نفخر بثقة عملائنا المتزايدة يوماً بعد يوم. أرقامنا تعكس التزامنا بتقديم أفضل الخدمات والمنتجات في عالم الألعاب.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "200px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-4 md:p-5 bg-gray-900/60 backdrop-blur-md border border-gray-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
              >
                <div className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2">+150%</div>
                <div className="text-xs md:text-sm text-gray-400 font-arabic font-medium">نمو المبيعات</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "200px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-4 md:p-5 bg-gray-900/60 backdrop-blur-md border border-gray-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
              >
                <div className="text-2xl md:text-3xl font-black text-gray-300 mb-1 md:mb-2">100</div>
                <div className="text-xs md:text-sm text-gray-400 font-arabic font-medium">عميل نشط شهرياً</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Chart */}
          <motion.div 
            ref={chartRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-2 h-[280px] md:h-[400px] w-full bg-gray-900/80 border border-gray-800 shadow-[0_8px_30px_rgba(255,255,255,0.04)] rounded-3xl p-4 md:p-6 relative"
          >
            {isChartInView && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#888888" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#888888" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#ffffff" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    name="المبيعات (Sales)"
                    isAnimationActive={true}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#888888" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    name="العملاء (Users)"
                    isAnimationActive={true}
                    animationDuration={2000}
                    animationBegin={500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
