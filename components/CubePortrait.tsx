'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Tile = { x: number; y: number; color: string; phase: number };

function samplePortrait(imageUrl: string, cols: number, rows: number): Promise<Tile[]> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve([]); return; }

      // Center-crop to the portrait frame, then sample one pixel per cube.
      const targetRatio = cols / rows;
      const imageRatio = image.width / image.height;
      let sx = 0, sy = 0, sw = image.width, sh = image.height;
      if (imageRatio > targetRatio) {
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
      } else {
        sh = image.width / targetRatio;
        sy = (image.height - sh) / 2;
      }
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cols, rows);
      const pixels = ctx.getImageData(0, 0, cols, rows).data;
      const result: Tile[] = [];
      const stepX = 3.9 / cols;
      const stepY = 4.85 / rows;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          // Slight gamma lift keeps dark hair and clothing readable on dark UI.
          const brighten = (v: number) => Math.min(255, Math.round(255 * Math.pow(v / 255, 0.78)));
          const rgb = [brighten(pixels[i]), brighten(pixels[i + 1]), brighten(pixels[i + 2])];
          const color = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
          result.push({
            x: (x - (cols - 1) / 2) * stepX,
            y: ((rows - 1) / 2 - y) * stepY,
            color,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
      resolve(result);
    };
    image.onerror = () => resolve([]);
    image.src = imageUrl;
  });
}

function Mosaic({ imageUrl, mobile, onSelect, accent }: {
  imageUrl: string;
  mobile: boolean;
  onSelect: (n: number) => void;
  accent: string;
}) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [failed, setFailed] = useState(false);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const active = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { pointer } = useThree();
  const cols = mobile ? 40 : 72;
  const rows = mobile ? 50 : 90;

  useEffect(() => {
    let live = true;
    setFailed(false);
    samplePortrait(imageUrl, cols, rows).then((next) => {
      if (!live) return;
      setTiles(next);
      setFailed(next.length === 0);
    });
    return () => { live = false; };
  }, [imageUrl, cols, rows]);

  useEffect(() => {
    if (!mesh.current || !tiles.length) return;
    tiles.forEach((tile, i) => {
      dummy.position.set(tile.x, tile.y, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, new THREE.Color(tile.color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [tiles, dummy]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.13, 3.5, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.09, 3.5, delta);
    }
    if (!mesh.current || !tiles.length) return;
    const time = state.clock.elapsedTime;
    tiles.forEach((tile, i) => {
      const selected = i === active.current;
      const idleLift = Math.sin(time * 1.2 + tile.phase) * 0.008;
      const lift = selected ? 0.42 : idleLift;
      const scale = selected ? 1.35 : 1;
      dummy.position.set(tile.x, tile.y, lift);
      dummy.scale.set(0.050 * scale, 0.050 * scale, (selected ? 0.20 : 0.10) * scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <group ref={group}>
    {tiles.length > 0 ? (
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, tiles.length]}
        onPointerMove={(event) => {
          event.stopPropagation();
          if (event.instanceId !== undefined && active.current !== event.instanceId) {
            active.current = event.instanceId;
            onSelect(event.instanceId);
          }
        }}
        onPointerOut={() => {
          if (!mobile) {
            active.current = -1;
            onSelect(-1);
          }
        }}
        onClick={(event) => {
          if (event.instanceId !== undefined) {
            active.current = event.instanceId;
            onSelect(event.instanceId);
          }
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    ) : (
      <mesh>
        <planeGeometry args={[3.9, 4.85]} />
        <meshBasicMaterial color={failed ? '#141d30' : accent} />
      </mesh>
    )}
    <mesh position={[0, 0, -0.18]}>
      <planeGeometry args={[4.08, 5.03]} />
      <meshBasicMaterial color="#090d16" />
    </mesh>
  </group>;
}

const defaultDetails = [
  'Guest relations & front desk',
  'Visitor and client management',
  'Lobby & meeting-room operations',
  'Access-card coordination',
  'Facility-team coordination',
  'Daily reporting & documentation',
  'MS Office & registers',
  'SOP compliance'
];

export default function CubePortrait({
  imageUrl,
  accent = '#60a5fa',
  mobile = false,
  details = defaultDetails
}: {
  imageUrl: string;
  accent?: string;
  mobile?: boolean;
  details?: string[];
}) {
  const [active, setActive] = useState(-1);
  const [isMobile, setIsMobile] = useState(mobile);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 700);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const activeDetail = active >= 0 && details.length ? details[active % details.length] : '';

  return <div className="cube-wrap" aria-label="Interactive 3D cube portrait. Hover any cube or tap a cube to reveal a skill.">
    <Canvas
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0, 7.7], fov: 42 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ gl }) => { gl.setClearColor('#000000', 0); }}
    >
      <Suspense fallback={null}>
        <Mosaic imageUrl={imageUrl} mobile={isMobile} onSelect={setActive} accent={accent} />
      </Suspense>
    </Canvas>
    <div className="cube-detail-panel" aria-live="polite">
      <span className="cube-detail-index">{active >= 0 ? String((active % Math.max(details.length, 1)) + 1).padStart(2, '0') : '✦'}</span>
      <span>{activeDetail || 'Hover a cube · tap to pin a skill'}</span>
    </div>
    <div className="cube-caption"><span className="live-dot" />{active >= 0 ? 'CUBE EXTRUDED · SKILL REVEALED' : 'MOVE / TAP TO EXPLORE THE PORTRAIT'}</div>
  </div>;
}
