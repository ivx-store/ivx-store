const fs = require('fs');

const file = './src/components/Services.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `import { motion } from "motion/react";
import { ReactNode } from "react";
import { PenTool, Camera, Megaphone, User, Code, Layout, Smartphone, Search, Share2, Target, BarChart, CheckCircle2 } from "lucide-react";

function Card1Animation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      {/* Central Glow */}
      <div className="absolute w-20 h-20 bg-gradient-to-tr from-toper-blue/40 to-toper-orange/40 rounded-full blur-xl anim-pulse" />
      
      {/* Orbiting Icons */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="absolute anim-orbit-1">
          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-toper-blue border border-gray-100">
            <PenTool size={20} strokeWidth={2.5} />
          </div>
        </div>
        <div className="absolute anim-orbit-2">
          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-toper-orange border border-gray-100">
            <Camera size={20} strokeWidth={2.5} />
          </div>
        </div>
        <div className="absolute anim-orbit-3">
          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-400 border border-gray-100">
            <Megaphone size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card2Animation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ perspective: 1000 }}>
      {/* 3D Target */}
      <div className="absolute flex items-center justify-center z-10" style={{ transformStyle: "preserve-3d", transform: "rotateX(60deg) rotateY(40deg) rotateZ(20deg)" }}>
         <div className="absolute w-44 h-44 rounded-full bg-gray-300" style={{ transform: "translateZ(-12px)" }} />
         <div className="absolute w-44 h-44 rounded-full bg-gray-200" style={{ transform: "translateZ(-6px)" }} />
         <div className="w-44 h-44 relative rounded-full bg-white shadow-sm flex items-center justify-center" style={{ transform: "translateZ(0px)" }}>
            <div className="w-32 h-32 rounded-full bg-toper-blue flex items-center justify-center">
               <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-toper-orange" />
               </div>
            </div>
         </div>
         {/* Shockwave */}
         <div className="absolute border-toper-orange rounded-full z-20 anim-shockwave" style={{ width: 40, height: 40 }} />
      </div>

      {/* Arrow */}
      <div className="absolute z-30 anim-shoot" style={{ left: '50%', top: '50%' }}>
        <div className="absolute anim-wobble" style={{ left: 0, top: -15, width: 140, height: 30 }}>
          <svg viewBox="0 0 140 30" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="shaft" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <rect x="20" y="13" width="100" height="4" fill="url(#shaft)" rx="2" />
            <path d="M0,15 L25,5 L20,15 L25,25 Z" fill="#1e293b" />
            <path d="M105,13 L125,2 L115,13 Z" fill="#ea580c" />
            <path d="M105,17 L125,28 L115,17 Z" fill="#ea580c" />
            <path d="M115,10 L135,5 L125,15 L135,25 L115,20 Z" fill="#f97316" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Card3Animation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* IG Wireframe */}
      <div className="w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 flex justify-between items-center px-1">
            <div className="flex flex-col items-center gap-1"><div className="w-6 h-3 bg-gray-300 rounded-sm"/><div className="w-8 h-2 bg-gray-200 rounded-sm"/></div>
            <div className="flex flex-col items-center gap-1"><div className="w-6 h-3 bg-gray-300 rounded-sm"/><div className="w-8 h-2 bg-gray-200 rounded-sm"/></div>
            <div className="flex flex-col items-center gap-1"><div className="w-6 h-3 bg-gray-300 rounded-sm"/><div className="w-8 h-2 bg-gray-200 rounded-sm"/></div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="w-20 h-2.5 bg-gray-300 rounded-sm" />
          <div className="w-32 h-2 bg-gray-200 rounded-sm" />
          <div className="w-24 h-2 bg-gray-200 rounded-sm" />
        </div>
        {/* Follow Button */}
        <div className="w-full h-8 rounded-lg flex items-center justify-center text-xs font-bold tracking-wide anim-btn" />
        <div className="grid grid-cols-3 gap-1 mt-1">
          <div className="aspect-square bg-gray-100 rounded-sm" />
          <div className="aspect-square bg-gray-100 rounded-sm" />
          <div className="aspect-square bg-gray-100 rounded-sm" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute z-20 flex items-center justify-center pointer-events-none w-full h-full">
        <div className="absolute text-toper-orange anim-float-1" style={{ left: '25%' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div className="absolute text-toper-blue anim-float-2" style={{ left: '65%' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" /></svg>
        </div>
        <div className="absolute font-black text-3xl text-toper-blue anim-float-3" style={{ left: '45%', WebkitTextStroke: '1px white' }}>+10K</div>
        <div className="absolute text-toper-orange anim-float-4" style={{ left: '75%' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
      </div>

      {/* Mouse Cursor */}
      <div className="absolute z-30 w-6 h-6 origin-top-left anim-cursor" style={{ left: '50%', top: '50%', marginLeft: -24, marginTop: 16 }}>
        <svg viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.44c.45 0 .67-.54.35-.85L6.35 3.21a.5.5 0 00-.85.35z" fill="#ffffff" stroke="#000000" strokeWidth="1.5"/>
        </svg>
      </div>
    </div>
  );
}

function Card4Animation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Browser Window */}
      <div className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-10" style={{ width: 200, height: 140 }}>
        {/* Header */}
        <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center justify-end px-2 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        </div>
        {/* Body */}
        <div className="p-4 relative h-full w-full flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="bg-toper-blue rounded-md w-12 h-6" />
            <div className="bg-toper-orange/10 border border-toper-orange/30 rounded-md w-12 h-6 flex items-center justify-center text-toper-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="h-2 bg-gray-300 rounded-sm anim-type-1" />
            <div className="h-2 bg-gray-200 rounded-sm anim-type-2" />
            <div className="h-2 bg-gray-200 rounded-sm anim-type-3" />
            <div className="h-2 bg-gray-200 rounded-sm anim-type-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedCard(`;

const regex = /import \{ motion, AnimatePresence \} from "motion\/react";[\s\S]*?function AnimatedCard\(/;
content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Replaced successfully');
