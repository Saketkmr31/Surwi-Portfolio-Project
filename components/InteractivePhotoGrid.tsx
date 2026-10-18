'use client';

import { useState } from 'react';

const corporateSkills = [
  ['01', 'Guest relations', 'Warm, professional visitor experience'],
  ['02', 'Visitor management', 'Smooth arrivals and client handling'],
  ['03', 'Front-desk operations', 'Reception and lobby coordination'],
  ['04', 'Meeting rooms', 'Room readiness and hospitality'],
  ['05', 'Access cards', 'Activation and access coordination'],
  ['06', 'Facility operations', 'Cross-team issue follow-up'],
  ['07', 'Daily reporting', 'Registers, Excel and documentation'],
  ['08', 'SOP compliance', 'Consistent service standards'],
];
const creatorSkills = [
  ['01', 'Traditional styling', 'Saree looks and festive fashion'],
  ['02', 'Fashion reels', 'Outfit transitions and styling'],
  ['03', 'Beauty looks', 'Makeup, jewellery and details'],
  ['04', 'Lifestyle', 'Everyday moments and visual diaries'],
  ['05', 'Storytelling', 'Turning moments into short-form stories'],
  ['06', 'Brand work', 'Creator partnerships and campaigns'],
  ['07', 'Visual mood', 'Colour, light and composition'],
  ['08', 'Social content', 'Reels, posts and community'],
];

export default function InteractivePhotoGrid({ image, variant = 'corporate' }: { image: string; variant?: 'corporate' | 'creator' }) {
  const [active, setActive] = useState<number | null>(null);
  const skills = variant === 'creator' ? creatorSkills : corporateSkills;

  return (
    <div className={'interactive-photo-grid ' + variant} aria-label="Floating 3D skill cubes">
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
        {active !== null ? skills[active][1] + ' — ' + skills[active][2] : 'Hover / tap a floating cube'}
      </div>
    </div>
  );
}
