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

type PhotoParticle = { x: number; y: number; color: string; size: number; phase: number };

export default function InteractivePhotoGrid({ image, variant = 'corporate' }: { image: string; variant?: 'corporate' | 'creator' }) {
  const [active, setActive] = useState<number | null>(null);
  const skills = variant === 'creator' ? creatorSkills : corporateSkills;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !host || !ctx) return;

    const photo = new Image();
    photo.decoding = 'async';
    photo.src = image;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let photoX = 0;
    let photoY = 0;
    let photoW = 0;
    let photoH = 0;
    let particles: PhotoParticle[] = [];
    let sampleCanvas: HTMLCanvasElement | null = null;
    let sampleCtx: CanvasRenderingContext2D | null = null;
    let ready = false;
    const accent = variant === 'creator' ? [235, 171, 255] : [135, 194, 255];

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (photo.complete && photo.naturalWidth) preparePhoto();
    };

    const preparePhoto = () => {
      if (!photo.naturalWidth || !width || !height) return;
      const mobile = width <= 700;
      photoH = height;
      photoW = Math.min(photoH * photo.naturalWidth / photo.naturalHeight, width * (mobile ? .86 : .52));
      photoH = photoW * photo.naturalHeight / photo.naturalWidth;
      photoX = width * .5 - photoW * (mobile ? .05 : .02);
      photoY = height - photoH;
      sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = Math.max(1, Math.round(photoW));
      sampleCanvas.height = Math.max(1, Math.round(photoH));
      sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      if (!sampleCtx) return;
      sampleCtx.drawImage(photo, 0, 0, sampleCanvas.width, sampleCanvas.height);
      const pixels = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      particles = [];
      // Small source-image fragments preserve the original portrait's real colours and detail.
      const step = Math.max(6, Math.round(Math.max(photoW, photoH) / 150));
      for (let y = 0; y < sampleCanvas.height; y += step) {
        for (let x = 0; x < sampleCanvas.width; x += step) {
          const k = (y * sampleCanvas.width + x) * 4;
          if (pixels[k + 3] < 70) continue;
          const color = `rgba(${pixels[k]},${pixels[k + 1]},${pixels[k + 2]},${Math.min(1, pixels[k + 3] / 255)})`;
          particles.push({ x: photoX + x, y: photoY + y, color, size: step * (.62 + Math.random() * .34), phase: Math.random() * Math.PI * 2 });
        }
      }
      ready = true;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      if (ready && photo.complete) {
        // The canvas renders the actual source portrait at native aspect ratio, not a generated substitute.
        ctx.drawImage(photo, photoX, photoY, photoW, photoH);
        const p = pointerRef.current;
        const withinPhoto = p.active && p.x >= photoX && p.x <= photoX + photoW && p.y >= photoY && p.y <= photoY + photoH;
        if (withinPhoto) {
          const radius = Math.max(width <= 700 ? 58 : 76, Math.min(width <= 700 ? 92 : 112, photoW * .19));
          // Cut a soft opening in the photo so displaced photo pixels visibly disperse into the backdrop.
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          const hole = ctx.createRadialGradient(p.x, p.y, radius * .24, p.x, p.y, radius);
          hole.addColorStop(0, 'rgba(0,0,0,.94)');
          hole.addColorStop(.72, 'rgba(0,0,0,.72)');
          hole.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = hole;
          ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          // Draw the original photo's sampled pixels as fragments pushed away from the cursor.
          for (const dot of particles) {
            const dx = dot.x - p.x;
            const dy = dot.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist > radius * 1.22) continue;
            const safeDist = Math.max(1, dist);
            const force = (1 - Math.min(1, dist / (radius * 1.22))) * (12 + radius * .22);
            const wobble = Math.sin(time * .0017 + dot.phase) * 1.4;
            const x = dot.x + dx / safeDist * force + wobble;
            const y = dot.y + dy / safeDist * force - wobble * .55;
            ctx.fillStyle = dot.color;
            ctx.shadowColor = `rgba(${accent[0]},${accent[1]},${accent[2]},.45)`;
            ctx.shadowBlur = 5;
            ctx.fillRect(x, y, dot.size, dot.size);
          }
          ctx.shadowBlur = 0;
          // Fine light motes and links accent the real pixel fragments, rather than replacing them.
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const moteCount = 24;
          for (let i = 0; i < moteCount; i++) {
            const angle = time * .00025 + i * 2.399;
            const orbit = 18 + ((i * 37) % Math.max(40, radius - 12));
            const mx = p.x + Math.cos(angle) * orbit;
            const my = p.y + Math.sin(angle * 1.13) * orbit;
            const alpha = .24 + .3 * (Math.sin(time * .003 + i) + 1) / 2;
            ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`;
            ctx.beginPath(); ctx.arc(mx, my, i % 4 === 0 ? 1.8 : 1.1, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    if (photo.complete && photo.naturalWidth) preparePhoto();
    photo.onload = () => preparePhoto();
    photo.onerror = () => { ready = false; };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); photo.onload = null; };
  }, [image, variant]);

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  };
  const clearPointer = () => { pointerRef.current.active = false; };

  return (
    <div className={'interactive-photo-grid ' + variant} aria-label="Interactive portrait with photo-pixel dispersion and 3D skill cubes"
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
