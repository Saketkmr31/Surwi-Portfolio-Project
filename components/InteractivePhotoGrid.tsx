'use client';

import { useEffect, useRef, useState } from 'react';

type Skill = [string, string, string];

const corporateSkills: Skill[] = [
  ['01', 'Guest relations', 'Warm, professional visitor experience'],
  ['02', 'Visitor management', 'Smooth arrivals and client handling'],
  ['03', 'Front-desk operations', 'Reception and lobby coordination'],
  ['04', 'Meeting rooms', 'Room readiness and hospitality'],
  ['05', 'Access cards', 'Activation and access coordination'],
  ['06', 'Facility operations', 'Cross-team issue follow-up'],
  ['07', 'Daily reporting', 'Registers, Excel and documentation'],
  ['08', 'SOP compliance', 'Consistent service standards'],
];
const creatorSkills: Skill[] = [
  ['01', 'Traditional styling', 'Saree looks and festive fashion'],
  ['02', 'Fashion reels', 'Outfit transitions and styling'],
  ['03', 'Beauty looks', 'Makeup, jewellery and details'],
  ['04', 'Lifestyle', 'Everyday moments and visual diaries'],
  ['05', 'Storytelling', 'Turning moments into short-form stories'],
  ['06', 'Brand work', 'Creator partnerships and campaigns'],
  ['07', 'Visual mood', 'Colour, light and composition'],
  ['08', 'Social content', 'Reels, posts and community'],
];

type Particle = { x: number; y: number; ox: number; oy: number; r: number; phase: number; speed: number };

export default function InteractivePhotoGrid({ image, variant = 'corporate' }: { image: string; variant?: 'corporate' | 'creator' }) {
  const [active, setActive] = useState<number | null>(null);
  const skills = variant === 'creator' ? creatorSkills : corporateSkills;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;
    let raf = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(150, Math.max(64, Math.round(width * height / 10500)));
      particles = Array.from({ length: count }, (_, i) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return { x, y, ox: x, oy: y, r: .6 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2, speed: .25 + Math.random() * .7 };
      });
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const p = pointerRef.current;
      const accent = variant === 'creator' ? [230, 155, 255] : [131, 190, 255];
      const points: { x: number; y: number; r: number }[] = [];
      for (const dot of particles) {
        const floatX = Math.sin(time * .00024 * dot.speed + dot.phase) * 8;
        const floatY = Math.cos(time * .0002 * dot.speed + dot.phase) * 7;
        let tx = dot.ox + floatX;
        let ty = dot.oy + floatY;
        if (p.active) {
          const dx = tx - p.x;
          const dy = ty - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = 155;
          if (dist < radius) {
            const force = (1 - dist / radius) * 27;
            tx += dx / dist * force;
            ty += dy / dist * force;
          }
        }
        dot.x += (tx - dot.x) * .075;
        dot.y += (ty - dot.y) * .075;
        const dx = dot.x - (p.active ? p.x : -1000);
        const dy = dot.y - (p.active ? p.y : -1000);
        const near = p.active ? Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 190) : 0;
        const alpha = .17 + near * .72;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r + near * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`;
        ctx.fill();
        if (near > .06) points.push({ x: dot.x, y: dot.y, r: near });
      }
      if (p.active) {
        ctx.lineWidth = .65;
        for (let i = 0; i < points.length; i++) {
          const a = points[i];
          for (let j = i + 1; j < points.length; j++) {
            const b = points[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 66) {
              ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${Math.min(a.r, b.r) * (1 - dist / 66) * .34})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 135);
        glow.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},.13)`);
        glow.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(p.x, p.y, 135, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [variant]);

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  };
  const clearPointer = () => { pointerRef.current.active = false; };

  return (
    <div className={'interactive-photo-grid ' + variant} aria-label="Interactive portrait particles and 3D skill cubes"
      onPointerMove={updatePointer} onPointerLeave={clearPointer} onPointerDown={updatePointer}>
      <canvas ref={canvasRef} className="photo-particle-canvas" aria-hidden="true" />
      <div className="skill-cube-field">
        {skills.map((skill, i) => (
          <button
            className={'skill-cube ' + (active === i ? 'is-active' : '')}
            key={skill[0]}
            type="button"
            aria-label={skill[1] + '. ' + skill[2]}
            aria-pressed={active === i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(active === i ? null : i)}
            style={{ '--cube-index': i } as React.CSSProperties}
          >
            <span className="skill-cube-shell">
              <span className="skill-cube-face skill-cube-front"><b>{skill[0]}</b><strong>{skill[1]}</strong><i>↗</i></span>
              <span className="skill-cube-face skill-cube-back"><b>{skill[0]} / SKILL</b><strong>{skill[1]}</strong><small>{skill[2]}</small></span>
              <span className="skill-cube-face skill-cube-side skill-cube-left" />
              <span className="skill-cube-face skill-cube-side skill-cube-right" />
              <span className="skill-cube-face skill-cube-side skill-cube-top" />
              <span className="skill-cube-face skill-cube-side skill-cube-bottom" />
            </span>
          </button>
        ))}
      </div>
      <div className={'photo-skill-chip ' + (active !== null ? 'visible' : '')} aria-live="polite">
        <span>{active !== null ? skills[active][0] : '✦'}</span>
        {active !== null ? skills[active][1] + ' — ' + skills[active][2] : 'Move across the portrait'}
      </div>
    </div>
  );
}
