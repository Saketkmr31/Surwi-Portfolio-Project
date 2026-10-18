'use client';

import { useMemo, useState } from 'react';

const corporateSkills = ['Guest relations', 'Visitor management', 'Front-desk operations', 'Meeting-room coordination', 'Access-card support', 'Facility operations', 'Daily reporting', 'SOP compliance'];
const creatorSkills = ['Traditional styling', 'Saree looks', 'Fashion transitions', 'Jewellery details', 'Beauty looks', 'Lifestyle stories', 'Reel storytelling', 'Brand collaborations'];

export default function InteractivePhotoGrid({ image, variant = 'corporate' }: { image: string; variant?: 'corporate' | 'creator' }) {
  const [active, setActive] = useState(-1);
  const cells = useMemo(() => Array.from({ length: 12 * 18 }, (_, i) => i), []);
  const skills = variant === 'creator' ? creatorSkills : corporateSkills;

  return (
    <div className={'interactive-photo-grid ' + variant} aria-label="Interactive 3D portrait cubes">
      <div className="photo-grid-tiles">
        {cells.map((cell) => {
          const x = cell % 12;
          const y = Math.floor(cell / 12);
          const skill = skills[cell % skills.length];
          return (
            <button
              className={'photo-cube ' + (active === cell ? 'is-active' : '')}
              key={cell}
              type="button"
              aria-label={'Explore ' + skill}
              onMouseEnter={() => setActive(cell)}
              onFocus={() => setActive(cell)}
              onMouseLeave={() => setActive(-1)}
              onBlur={() => setActive(-1)}
              onClick={() => setActive(active === cell ? -1 : cell)}
              style={{
                backgroundImage: 'url("' + image + '")',
                backgroundSize: '1200% 1800%',
                backgroundPosition: ((x / 11) * 100) + '% ' + ((y / 17) * 100) + '%',
                transitionDelay: active === cell ? '0ms' : ((cell % 12) * 13) + 'ms'
              }}
            >
              <span className="photo-cube-front" />
              <span className="photo-cube-back"><b>{String((cell % skills.length) + 1).padStart(2, '0')}</b><strong>{skill}</strong></span>
            </button>
          );
        })}
      </div>
      <div className={'photo-skill-chip ' + (active >= 0 ? 'visible' : '')} aria-live="polite">
        <span>{active >= 0 ? String((active % skills.length) + 1).padStart(2, '0') : '✦'}</span>
        {active >= 0 ? skills[active % skills.length] : 'Hover a cube to reveal a skill'}
      </div>
      <div className="floating-cube cube-one" />
      <div className="floating-cube cube-two" />
      <div className="floating-cube cube-three" />
    </div>
  );
}
