'use client';

import { useMemo, useState } from 'react';

const corporateSkills = ['Guest relations','Visitor management','Front-desk operations','Meeting-room coordination','Access-card support','Facility operations','Daily reporting','SOP compliance'];
const creatorSkills = ['Traditional styling','Saree looks','Fashion transitions','Jewellery details','Beauty looks','Lifestyle stories','Reel storytelling','Brand collaborations'];

export default function InteractivePhotoGrid({ image, variant = 'corporate' }: { image: string; variant?: 'corporate' | 'creator' }) {
  const [active, setActive] = useState(-1);
  const cells = useMemo(() => Array.from({ length: 18 * 26 }, (_, i) => i), []);
  const skills = variant === 'creator' ? creatorSkills : corporateSkills;
  return <div className={'interactive-photo-grid ' + variant} aria-label="Interactive portrait. Hover tiles to reveal skills.">
    <div className="photo-grid-tiles">{cells.map((cell) => {
      const x = cell % 18; const y = Math.floor(cell / 18);
      return <button className={'photo-grid-tile ' + (active === cell ? 'is-active' : '')} key={cell} type="button" aria-label={skills[cell % skills.length]} onMouseEnter={() => setActive(cell)} onFocus={() => setActive(cell)} onMouseLeave={() => setActive(-1)} onBlur={() => setActive(-1)} onClick={() => setActive(active === cell ? -1 : cell)} style={{ backgroundImage: 'url("' + image + '")', backgroundSize: '1800% 2600%', backgroundPosition: ((x / 17) * 100) + '% ' + ((y / 25) * 100) + '%', transitionDelay: active === cell ? '0ms' : ((cell % 9) * 12) + 'ms' }} />;
    })}</div>
    <div className={'photo-skill-chip ' + (active >= 0 ? 'visible' : '')} aria-live="polite"><span>{active >= 0 ? String((active % skills.length) + 1).padStart(2, '0') : '✦'}</span>{active >= 0 ? skills[active % skills.length] : 'Hover / tap a tile to explore'}</div>
    <div className="floating-cube cube-one" /><div className="floating-cube cube-two" /><div className="floating-cube cube-three" />
  </div>;
}
