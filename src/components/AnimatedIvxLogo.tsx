import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useDevicePerformance } from '../lib/useDevicePerformance';

export function AnimatedIvxLogo({ className = "w-full h-full", onComplete, fastMode = false, speedMultiplier = 1 }: { className?: string, onComplete?: () => void, fastMode?: boolean, speedMultiplier?: number }) {
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startParticlesRef = useRef<(() => void) | null>(null);
  const { isLowEnd, isMobile } = useDevicePerformance();

  // Animation controls
  const bgCControls = useAnimation();
  const ringControls = useAnimation();
  const sparkControls = useAnimation();
  const pLControls = useAnimation();
  const pVControls = useAnimation();
  const pDControls = useAnimation();
  const pDotControls = useAnimation();
  const pulseControls = useAnimation();
  const flashControls = useAnimation();
  const bgGlowControls = useAnimation();
  const idleAuraControls = useAnimation();

  // Speed multipliers — faster on low-end to reduce total animation time
  const effectiveSpeed = isLowEnd ? speedMultiplier * 0.5 : speedMultiplier;
  const tMs = (ms: number) => (fastMode ? ms * 0.15 : ms) * effectiveSpeed;
  const tS = (sec: number) => (fastMode ? sec * 0.15 : sec) * effectiveSpeed;

  // Easings
  const eIO3 = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eIO5 = (t: number) => t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  const eO4 = (t: number) => 1 - Math.pow(1 - t, 4);
  const eO5 = (t: number) => 1 - Math.pow(1 - t, 5);
  const eO6 = (t: number) => 1 - Math.pow(1 - t, 6);
  const eSm = (t: number) => t * t * (3 - 2 * t);

  // Wait helper
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Custom animation helper for complex properties
  const animateValue = (dur: number, cb: (val: number, raw: number) => void, ef: (t: number) => number = eIO3) => {
    return new Promise<void>(res => {
      const s = performance.now();
      const tick = (n: number) => {
        const raw = Math.min((n - s) / dur, 1);
        cb(ef(raw), raw);
        if (raw < 1) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
  };

  // Particle effect for the background removed as requested
  useEffect(() => {
    // Expose control to the main sequence via ref (no-op now)
    startParticlesRef.current = () => {
      // Particles removed
    };

    return () => {
      startParticlesRef.current = null;
    };
  }, []);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isMounted = true;
    // Store rAF ID so we can cancel on unmount
    let floatRafId: number | null = null;

    const runSequence = async () => {
      // Wait a tick for Framer Motion to attach controls to the DOM elements
      await new Promise(resolve => setTimeout(resolve, 50));
      if (!isMounted) return;

      try {
        // Initial state
        bgCControls.set({ opacity: 0 });
        ringControls.set({ opacity: 0, pathLength: 0, strokeWidth: 4, stroke: '#8ec5ff' });
        sparkControls.set({ opacity: 0 });
        pLControls.set({ opacity: 0, pathLength: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' });
        pVControls.set({ opacity: 0, pathLength: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' });
        pDControls.set({ opacity: 0, pathLength: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' });
        pDotControls.set({ opacity: 0, pathLength: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' });
        pulseControls.set({ opacity: 0, r: 100, strokeWidth: 4 });
        flashControls.set({ opacity: 0 });
        bgGlowControls.set({ opacity: 0 });
      } catch (e) {
        console.warn("Framer motion controls not ready", e);
        return;
      }

      if (sceneRef.current) {
        sceneRef.current.style.opacity = '0';
        sceneRef.current.style.transform = 'scale(.82)';
        sceneRef.current.style.filter = isLowEnd ? 'none' : 'blur(8px)';
      }

      await wait(tMs(500));
      if (!isMounted) return;

      // PHASE 1 — DRAWING
      if (sceneRef.current) {
        sceneRef.current.style.transition = `opacity ${tS(3)}s cubic-bezier(.22,1,.36,1), transform ${tS(3)}s cubic-bezier(.22,1,.36,1)${isLowEnd ? '' : `, filter ${tS(3.5)}s cubic-bezier(.22,1,.36,1)`}`;
        sceneRef.current.style.opacity = '1';
        sceneRef.current.style.transform = 'scale(1)';
        if (!isLowEnd) sceneRef.current.style.filter = 'blur(0px)';
      }

      bgCControls.start({ opacity: 0.3, transition: { duration: tS(2.5), ease: eO6 } });

      await wait(tMs(1200));
      if (!isMounted) return;
      if (!isLowEnd) {
        bgGlowControls.start({ opacity: 1, transition: { duration: tS(4), ease: [0.22, 1, 0.36, 1] } });
      }
      await wait(tMs(1000));
      if (!isMounted) return;

      // Ring outline
      ringControls.start({ opacity: 1, pathLength: 1, transition: { duration: tS(3.2), ease: eIO3 } });
      
      // Spark follows ring — skip on low-end for performance
      if (!isLowEnd) {
        animateValue(tMs(3200), (t) => {
          if (!isMounted) return;
          const a = -Math.PI / 2 + t * Math.PI * 2;
          sparkControls.set({
            cx: 2667 + 2549 * Math.cos(a),
            cy: 2667 + 2549 * Math.sin(a),
            opacity: t < .02 ? t / .02 : t > .97 ? (1 - t) / .03 : .8,
            r: 28 + 10 * Math.sin(t * Math.PI * 10)
          });
        }, eIO3);
      }

      await wait(tMs(3200));
      if (!isMounted) return;
      sparkControls.start({ opacity: 0, transition: { duration: tS(0.3), ease: "easeOut" } });
      await wait(tMs(250));
      if (!isMounted) return;

      // L
      pLControls.set({ opacity: 1 });
      await pLControls.start({ pathLength: 1, transition: { duration: tS(2), ease: eIO5 } });
      await wait(tMs(180));
      if (!isMounted) return;

      // V
      pVControls.set({ opacity: 1 });
      await pVControls.start({ pathLength: 1, transition: { duration: tS(2), ease: eIO5 } });
      await wait(tMs(180));
      if (!isMounted) return;

      // Diamond
      pDControls.set({ opacity: 1 });
      await pDControls.start({ pathLength: 1, transition: { duration: tS(1.4), ease: eIO5 } });
      await wait(tMs(180));
      if (!isMounted) return;

      // Dot
      pDotControls.set({ opacity: 1 });
      await pDotControls.start({ pathLength: 1, transition: { duration: tS(1.6), ease: eIO5 } });

      // PAUSE
      await wait(tMs(1000));
      if (!isMounted) return;

      // PHASE 2 — COLORING WAVE
      const flash = (i: number, d: number) => {
        if (!isMounted || isLowEnd) return; // Skip flash on low-end
        flashControls.set({ background: `radial-gradient(ellipse at 50% 50%,rgba(180,220,255,${i})0%,rgba(80,140,255,${i*.3})35%,transparent 65%)` });
        flashControls.start({ opacity: [0, 1, 0], transition: { duration: tS(d / 1000), times: [0, 0.12, 1], ease: "easeOut" } });
      };

      flash(0.12, 350);
      await wait(tMs(250));
      if (!isMounted) return;
      flash(0.32, 650);

      // Shake effect — skip on low-end
      if (sceneRef.current && !isLowEnd) {
        const sc = sceneRef.current;
        const s = performance.now();
        const tk = (n: number) => {
          if (!isMounted) return;
          const t = (n - s) / tMs(450);
          if (t >= 1) {
            sc.style.transform = 'scale(1)';
            return;
          }
          const d = 5 * (1 - t) * (1 - t);
          sc.style.transform = `scale(1) translate(${(Math.random() - .5) * d}px,${(Math.random() - .5) * d}px)`;
          requestAnimationFrame(tk);
        };
        requestAnimationFrame(tk);
      }

      // Pulse ring
      pulseControls.start({
        r: 3200,
        opacity: 0,
        strokeWidth: 1,
        transition: { duration: tS(1.8), ease: eO4 }
      });

      // BG circle darkens
      bgCControls.start({ opacity: 0.9, transition: { duration: tS(1.5), ease: eO5 } });

      // Diamond
      await wait(tMs(80));
      if (!isMounted) return;
      pDControls.start({
        fill: "rgba(254,254,254,1)",
        stroke: "rgba(254,254,254,1)",
        strokeWidth: 1.5,
        transition: { duration: tS(1.4), ease: eSm }
      });

      // L
      await wait(tMs(200));
      if (!isMounted) return;
      pLControls.start({
        fill: "rgba(254,254,254,1)",
        stroke: "rgba(254,254,254,1)",
        strokeWidth: 1.5,
        transition: { duration: tS(1.4), ease: eSm }
      });

      // V
      await wait(tMs(150));
      if (!isMounted) return;
      pVControls.start({
        fill: "rgba(254,254,254,1)",
        stroke: "rgba(254,254,254,1)",
        strokeWidth: 1.5,
        transition: { duration: tS(1.4), ease: eSm }
      });

      // Dot
      await wait(tMs(250));
      if (!isMounted) return;
      pDotControls.start({
        fill: "rgba(254,254,254,1)",
        stroke: "rgba(254,254,254,1)",
        strokeWidth: 1.5,
        transition: { duration: tS(1.2), ease: eSm }
      });

      // Ring thickens
      await wait(tMs(200));
      if (!isMounted) return;
      ringControls.start({
        strokeWidth: 108,
        stroke: "url(#ringGrad)",
        transition: { duration: tS(2.2), ease: eSm }
      });

      // Clean up strokes
      pLControls.start({ strokeWidth: 0, transition: { duration: tS(0.5) } });
      pVControls.start({ strokeWidth: 0, transition: { duration: tS(0.5) } });
      pDControls.start({ strokeWidth: 0, transition: { duration: tS(0.5) } });
      pDotControls.start({ strokeWidth: 0, transition: { duration: tS(0.5) } });

      // Completion flash
      flash(0.18, 450);
      await wait(tMs(300));
      if (!isMounted) return;

      // Gentle completion pulse — skip on low-end
      if (sceneRef.current && !isLowEnd) {
        sceneRef.current.style.transition = 'none';
        sceneRef.current.style.filter = 'none';
        animateValue(tMs(1200), (t) => {
          if (!isMounted || !sceneRef.current) return;
          const b = Math.sin(t * Math.PI);
          sceneRef.current.style.transform = `scale(${1 + .015 * b})`;
        }, eSm);
      }

      await wait(tMs(400));
      if (!isMounted) return;

      // PHASE 3 — IDLE STATE
      if (startParticlesRef.current) {
        startParticlesRef.current();
      }

      // Start the beautiful aura — only on desktop
      if (!isLowEnd) {
        idleAuraControls.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 2, ease: "easeOut" }
        });
      }

      // Start floating motion — use CSS animation on mobile for GPU compositing
      if (sceneRef.current) {
        if (isLowEnd) {
          // Use lightweight CSS class instead of rAF loop
          sceneRef.current.classList.add('idle-float-css');
        } else {
          // Desktop: use rAF for smoother, more organic feel
          let t = 0;
          const floatTick = () => {
            if (!isMounted || !sceneRef.current) return;
            t += .015;
            const y = Math.sin(t) * 15;
            const x = Math.sin(t * .7) * 8;
            const rot = Math.sin(t * .5) * 1.5;
            sceneRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
            floatRafId = requestAnimationFrame(floatTick);
          };
          floatRafId = requestAnimationFrame(floatTick);
        }
      }

      setIsAnimationDone(true);
      await wait(tMs(600));
      if (onCompleteRef.current && isMounted) {
        onCompleteRef.current();
      }
    };

    runSequence();

    return () => {
      isMounted = false;
      // Cancel floating rAF loop on unmount
      if (floatRafId !== null) {
        cancelAnimationFrame(floatRafId);
      }
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient BG Glows — hidden on low-end */}
      {!isLowEnd && (
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none"
          animate={bgGlowControls}
        >
          <div className="absolute top-[30%] left-[20%] w-[55vmax] h-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(15,40,100,0.14)_0%,transparent_65%)] mix-blend-screen" />
          <div className="absolute top-[42%] right-[12%] w-[45vmax] h-[45vmax] rounded-full bg-[radial-gradient(circle,rgba(55,20,100,0.08)_0%,transparent_65%)] mix-blend-screen" />
        </motion.div>
      )}

      {/* Flash Overlay — hidden on low-end */}
      {!isLowEnd && (
        <motion.div className="absolute inset-0 z-[5] pointer-events-none" animate={flashControls} />
      )}

      {/* Beautiful Idle Aura (Appears after animation) — hidden on low-end */}
      {!isLowEnd && (
        <motion.div
          className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={idleAuraControls}
        >
          <div className="w-[85%] h-[85%] rounded-full border border-blue-400/20 border-dashed animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-[95%] h-[95%] rounded-full border border-purple-400/10 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        </motion.div>
      )}

      <div ref={sceneRef} className="relative z-10 w-[min(72vw,72vh)] h-[min(72vw,72vh)] transform-gpu will-change-transform">
        <svg viewBox="0 0 5334 5334" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0c1225"/>
              <stop offset="100%" stopColor="#060a18"/>
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8ec5ff"/>
              <stop offset="50%" stopColor="#fefefe"/>
              <stop offset="100%" stopColor="#b8a0e8"/>
            </linearGradient>
            {/* Simplified filters for low-end; full filters for desktop */}
            {isLowEnd ? (
              <>
                <filter id="drawGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </>
            ) : (
              <>
                <filter id="drawGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/>
                  <feColorMatrix in="b" type="matrix" values="0.2 0 0 0 0.15 0 0.35 0 0 0.35 0 0 0.9 0 0.55 0 0 0 1.3 0" result="c"/>
                  <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="fillGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b"/>
                  <feColorMatrix in="b" type="matrix" values="0.4 0 0 0 0.3 0 0.5 0 0 0.5 0 0 1 0 0.7 0 0 0 2 0" result="c"/>
                  <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="sparkGlow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </>
            )}
          </defs>

          <motion.circle cx="2667" cy="2667" r="2600" fill="url(#bgGrad)" animate={bgCControls} />

          <motion.circle 
            cx="2667" cy="2667" r="2549" fill="none"
            animate={ringControls}
            style={{ rotate: -90, originX: "50%", originY: "50%" }}
          />

          <motion.path 
            d="M1707.5 2099L1709.5 2099L2017.5 2099L2018.5 2100L2020.5 2100L2023 2101.5L2708.5 3375L2711.5 3376L2714 3375L2811 3115.5L2825.5 3080Q2831 3079 2832 3082.5L2952 3356.5L2953 3363.5L2693 3799L2688.5 3800L2676 3781.5L1706 2108.5L1704 2102.5L1705 2100L1707.5 2099Z"
            strokeLinecap="round" strokeLinejoin="round" animate={pLControls}
            initial={{ opacity: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' }}
          />

          <motion.path 
            d="M3172.5 2073L3174.5 2073L3637.5 2073L3640 2074L3641 2078.5L3119 3036.5L3116 3044.5L3547 3950.5L3546 3954L3370.5 4056L3364.5 4059L3361.5 4059L3359 4056.5L3343 4024.5L2904 3131.5L2863 3050.5L2844 3009.5L3170 2074L3172.5 2073Z"
            strokeLinecap="round" strokeLinejoin="round" animate={pVControls}
            initial={{ opacity: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' }}
          />

          <motion.path 
            d="M2809.5 2544Q2814.3 2543.3 2815 2546.5L2904 2706.5L2905 2712.5L2816 2931.5L2811.5 2938Q2806.8 2938.8 2806 2935.5L2713 2750.5L2713 2746.5L2799 2562.5L2809.5 2544Z"
            strokeLinecap="round" strokeLinejoin="round" animate={pDControls}
            initial={{ opacity: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' }}
          />

          <motion.path 
            d="M1781.5 1303L1783.5 1304L1784.5 1303L1801.5 1303L1804.5 1304L1828.5 1305L1829.5 1306L1852.5 1309L1872.5 1314L1915.5 1330Q1972.1 1356.9 2011 1401.5Q2044.9 1439.1 2065 1490.5L2073 1514.5L2079 1539.5L2081 1558.5L2082 1559.5L2082 1567.5L2083 1568.5L2084 1603.5L2083 1606.5L2082 1630.5L2081 1631.5L2078 1654.5L2073 1674.5L2057 1717.5Q2030.1 1774.1 1985.5 1813Q1947.9 1846.9 1896.5 1867L1852.5 1880L1829.5 1883L1828.5 1884L1804.5 1885L1802.5 1886L1800.5 1886Q1795.8 1887.2 1794.5 1885Q1793 1887.5 1787.5 1886L1784.5 1885L1781.5 1886L1780.5 1885L1766.5 1885L1757.5 1883L1755.5 1883L1737.5 1881L1712.5 1875L1678.5 1863L1655.5 1852Q1608.1 1826.4 1574 1787.5Q1543.5 1753.5 1524 1708.5L1512 1674.5L1506 1649.5L1504 1631.5L1503 1630.5L1503 1621.5L1502 1620.5L1502 1618.5Q1503.5 1609 1501 1603.5L1501 1601.5L1502 1568.5L1503 1567.5L1503 1558.5L1504 1557.5L1506 1539.5L1512 1514.5L1524 1480.5Q1551.4 1417.9 1599.5 1376Q1633.5 1345.5 1678.5 1326L1712.5 1314L1728.5 1310L1756.5 1305L1780.5 1304L1781.5 1303Z"
            strokeLinecap="round" strokeLinejoin="round" animate={pDotControls}
            initial={{ opacity: 0, fill: 'none', strokeWidth: 5, stroke: 'rgba(150,195,255,.65)' }}
          />

          {!isLowEnd && (
            <motion.circle cx="2667" cy="117" r="40" fill="#fff" filter="url(#sparkGlow)" animate={sparkControls} initial={{ opacity: 0 }} />
          )}
          <motion.circle cx="2667" cy="2667" fill="none" stroke="rgba(140,200,255,.5)" animate={pulseControls} initial={{ opacity: 0 }} />
        </svg>
      </div>
    </div>
  );
}
