'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Tile = { x:number; y:number; z:number; color:string; phase:number };
function makeTiles(imageUrl:string, cols:number, rows:number): Promise<Tile[]> {
  return new Promise((resolve) => {
    const image = new Image(); image.src = imageUrl;
    image.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = cols; canvas.height = rows;
      const ctx = canvas.getContext('2d'); if (!ctx) { resolve([]); return; }
      const targetRatio = cols / rows, imageRatio = image.width / image.height;
      let sx=0, sy=0, sw=image.width, sh=image.height;
      if (imageRatio > targetRatio) { sw=image.height*targetRatio; sx=(image.width-sw)/2; }
      else { sh=image.width/targetRatio; sy=(image.height-sh)/2; }
      ctx.drawImage(image,sx,sy,sw,sh,0,0,cols,rows);
      const data=ctx.getImageData(0,0,cols,rows).data; const result:Tile[]=[];
      for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
        const i=(y*cols+x)*4; const r=data[i],g=data[i+1],b=data[i+2];
        result.push({x:(x-(cols-1)/2)*0.078,y:((rows-1)/2-y)*0.078,z:0,color:`#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`,phase:Math.random()*Math.PI*2});
      }
      resolve(result);
    };
    image.onerror=()=>resolve([]);
  });
}
function Mosaic({ imageUrl, mobile, onSelect, accent }:{imageUrl:string;mobile:boolean;onSelect:(n:number)=>void;accent:string}) {
  const [tiles,setTiles]=useState<Tile[]>([]); const mesh=useRef<THREE.InstancedMesh>(null); const group=useRef<THREE.Group>(null); const { pointer }=useThree();
  const active=useRef(-1); const dummy=useMemo(()=>new THREE.Object3D(),[]); const baseColors=useRef<THREE.Color[]>([]);
  const cols=mobile?32:48, rows=mobile?40:60;
  useEffect(()=>{let live=true; makeTiles(imageUrl,cols,rows).then(t=>{if(live)setTiles(t)});return()=>{live=false}},[imageUrl,cols,rows]);
  useEffect(()=>{if(!mesh.current||!tiles.length)return; baseColors.current=[]; tiles.forEach((t,i)=>{dummy.position.set(t.x,t.y,t.z);dummy.scale.setScalar(1);dummy.updateMatrix();mesh.current!.setMatrixAt(i,dummy.matrix);const c=new THREE.Color(t.color);baseColors.current.push(c);mesh.current!.setColorAt(i,c)});mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;},[tiles,dummy]);
  useFrame((state,delta)=>{
    if(group.current){group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,pointer.x*0.10,3,delta);group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,-pointer.y*0.07,3,delta);}
    if(!mesh.current||!tiles.length)return;
    const t=state.clock.elapsedTime;
    tiles.forEach((tile,i)=>{const selected=i===active.current;const dist=Math.hypot(tile.x/2.1,tile.y/2.5);const idle=Math.sin(t*1.5+tile.phase)*0.012;const lift=selected?0.38:idle;dummy.position.set(tile.x,tile.y,lift);const s=selected?1.22:1;dummy.scale.set(0.073*s,0.073*s,0.12*s);dummy.updateMatrix();mesh.current!.setMatrixAt(i,dummy.matrix);});
    mesh.current.instanceMatrix.needsUpdate=true;
  });
  return <group ref={group}>
    {tiles.length>0?<instancedMesh ref={mesh} args={[undefined,undefined,tiles.length]} onPointerMove={(e)=>{e.stopPropagation();if(e.instanceId!==undefined){active.current=e.instanceId;onSelect(e.instanceId)}}} onPointerOut={()=>{active.current=-1;onSelect(-1)}} onClick={(e)=>{if(e.instanceId!==undefined){active.current=e.instanceId;onSelect(e.instanceId)}}}>
      <boxGeometry args={[1,1,1]}/><meshStandardMaterial roughness={0.42} metalness={0.18} vertexColors/>
    </instancedMesh>:<mesh><planeGeometry args={[3.4,4.3]}/><meshBasicMaterial color={accent}/></mesh>}
    <mesh position={[0,0,-0.14]}><planeGeometry args={[3.85,4.85]}/><meshBasicMaterial color="#0a0e16"/></mesh>
  </group>
}
export default function CubePortrait({imageUrl,accent='#60a5fa',mobile=false}:{imageUrl:string;accent?:string;mobile?:boolean}) {
  const [active,setActive]=useState(-1); const [isMobile,setIsMobile]=useState(mobile);
  useEffect(()=>{const update=()=>setIsMobile(window.innerWidth<700);update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update)},[]);
  return <div className="cube-wrap" aria-label="Interactive 3D cube portrait. Move your pointer or tap the portrait to explore.">
    <Canvas dpr={isMobile?[1,1.25]:[1,1.7]} camera={{position:[0,0,7.7],fov:42}} gl={{antialias:!isMobile,alpha:true,powerPreference:'low-power'}} onCreated={({gl})=>{gl.setClearColor('#000000',0)}}>
      <ambientLight intensity={1.8}/><directionalLight position={[2,4,6]} intensity={2.1}/><pointLight position={[-3,-1,3]} color={accent} intensity={2}/><Suspense fallback={null}><Mosaic imageUrl={imageUrl} mobile={isMobile} onSelect={setActive} accent={accent}/></Suspense>
    </Canvas>
    <div className="cube-caption"><span className="live-dot"/>{active>=0?'CUBE SELECTED · EXPLORE THE DETAILS':'MOVE / TAP TO INTERACT'}</div>
  </div>
}
