'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ParticleScene = dynamic(() => import('./ParticleScene'), { ssr: false });

export default function ParticleHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollTRef = useRef(0);
  const labelARef = useRef<HTMLDivElement>(null);
  const labelBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const scrolled = -wrap.getBoundingClientRect().top;
      const total = wrap.offsetHeight - window.innerHeight;
      const t = Math.max(0, Math.min(1, scrolled / total));
      scrollTRef.current = t;

      // Fade portrait label in/out (visible at t=0, gone by t=0.25)
      if (labelARef.current) {
        labelARef.current.style.opacity = String(Math.max(0, 1 - t / 0.25));
      }
      // Fade project label in/out (visible at t=1, fading in from t=0.75)
      if (labelBRef.current) {
        labelBRef.current.style.opacity = String(Math.max(0, (t - 0.75) / 0.25));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={wrapRef} data-particle-wrap style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        {/* Three.js canvas fills the sticky viewport */}
        <ParticleScene scrollTRef={scrollTRef} />

        {/* Portrait label */}
        <div
          ref={labelARef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none"
          style={{ transition: 'opacity 0.1s' }}
        >
          <p className="text-white text-4xl font-semibold tracking-wide">
            Ahnaf Murshid
          </p>
          <p className="text-white/40 text-sm mt-2 tracking-[0.3em] uppercase">
            Full-Stack Developer
          </p>
          <p className="text-white/20 text-xs mt-6 tracking-widest animate-bounce">
            scroll
          </p>
        </div>

        {/* Project label */}
        <div
          ref={labelBRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none"
          style={{ opacity: 0, transition: 'opacity 0.1s' }}
        >
          <p className="text-indigo-400 text-4xl font-semibold tracking-wide">
            My Projects
          </p>
          <p className="text-white/40 text-sm mt-2 tracking-[0.3em] uppercase">
            Keep scrolling to explore
          </p>
        </div>
      </div>
    </div>
  );
}
