# Surwi Photo-First Portfolio — Technical Design & Implementation Spec

**Status:** implementation target, with deployment verification tracked separately  
**Routes:** `/corporate/`, `/creator/`  
**Stack:** Next.js 14, React 18, TypeScript, CSS, Canvas 2D  
**Visual objective:** the portrait is the primary visual surface across the experience; typography and controls remain minimal and readable.

## 1. Current-state diagnosis

The supplied browser screenshot shows:
- The portrait occupies a narrow central column while the hero has large, low-information dark regions.
- The cursor effect produces a dense pixel halo around the face rather than a controlled, localized dispersion.
- Skill cubes obscure the person and compete with the face instead of supporting the image.
- Existing CSS has many appended overrides, so source order is difficult to reason about.
- The live screenshot alone does not prove the source asset's pixel dimensions or the deployed build's status.

## 2. Experience requirements

1. **Photo-led page:** use the real portrait as the hero's principal visual. Use a softly blurred, darkened enlargement of the same source behind it to fill widescreen space without stretching the subject.
2. **Original aspect ratio:** never stretch the portrait. Render it with `object-fit: contain` in the foreground; use `cover` only for the blurred backdrop.
3. **Pointer interaction:** pointer movement over the portrait should create a localized, reversible pixel-fragment dispersion from the source image. It must not create a permanent hole or a face-shaped ring of random particles.
4. **3D skill objects:** skill cubes should float with restrained perspective rotation, flip on hover/focus, stay away from critical facial features where practical, and be usable by keyboard/touch.
5. **Minimal content:** keep only one headline, one concise introduction, one primary CTA, a small identity label, and the interactive skills. Keep detailed work history and contact below the fold rather than crowding the portrait.
6. **Smoothness:** cap device-pixel ratio, keep the particle count bounded, throttle heavy work to pointer-near regions, cancel animation frames on unmount, and respect reduced-motion settings.
7. **Responsive behavior:** adapt portrait size, text position and cube size for desktop, tablet and mobile. Keep CTA links interactive above the visual canvas.
8. **Quality:** no CSS stretching, no upscaling claims. A genuine 4K asset is only possible if the source image has enough pixels; CSS cannot add source detail.

## 3. Implementation approach

- Preserve the original photo as the semantic image and render a separate blurred backdrop from the same source.
- Use a canvas overlay aligned to the foreground portrait's actual displayed rectangle. The canvas draws sampled source-image fragments only in the interaction radius; it does not independently redraw the entire portrait using a mismatched crop.
- On pointer movement, sample image pixels from a small offscreen canvas, displace nearby fragments radially with eased motion, and add a restrained glow. When the pointer leaves, fragments return to their source positions.
- Keep the cube field as independent DOM buttons with CSS 3D transforms so text stays crisp and controls remain accessible.
- Add a final, clearly marked photo-first override block rather than rewriting the whole historical stylesheet in one risky operation.

## 4. Acceptance checks

- [ ] Main portrait is clearly larger and its original aspect ratio is preserved.
- [ ] No permanent hole, halo, or mosaic remains after pointer leaves.
- [ ] Pixel dispersion is limited to the pointer area and returns smoothly.
- [ ] Cubes have visible depth/rotation and flip to concise skill details.
- [ ] Headline, CTA and navigation remain readable and clickable.
- [ ] Mobile layout does not crop the subject's face or overlap the CTA.
- [ ] `npm run typecheck` and `npm run build` pass.
- [ ] Vercel deployment is Ready and both routes are checked in the browser.
- [ ] Asset dimensions are inspected before claiming 4K quality.

## 5. Known limits and evidence

A screenshot can confirm the visual symptom, but cannot establish the source asset's pixel dimensions. Deployment checks and a browser interaction test are required before calling the work finished.