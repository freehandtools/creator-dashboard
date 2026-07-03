'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

function MascotModel({ isWhiteDiffuse, charPointer }: { isWhiteDiffuse?: boolean, charPointer?: { current: { x: number, y: number } } }) {
  const { scene } = useGLTF('/character3d.glb?v=2')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  
  const modelRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Object3D | null>(null)
  const headBaseRotationRef = useRef<THREE.Euler | null>(null)
  const introDelayRef = useRef(0.18)
  const introProgress = useRef(0)

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = (mesh.material as THREE.Material).clone()
        
        if (isWhiteDiffuse) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.map = null
          mat.normalMap = null     
          mat.roughnessMap = null
          mat.color = new THREE.Color('#ffffff')
          mat.roughness = 0.55     
          mat.metalness = 0.0
          mat.needsUpdate = true
        }
      }

      if ((child as THREE.Bone).isBone && child.name.toLowerCase() === 'head') {
        headRef.current = child
        headBaseRotationRef.current = child.rotation.clone()
      }
    })
  }, [clone, isWhiteDiffuse])

  useFrame((state, delta) => {
    introDelayRef.current = Math.max(0, introDelayRef.current - delta)

    if (introProgress.current < 1 && modelRef.current) {
      const introDelta = introDelayRef.current > 0 ? delta * 0.08 : delta * 0.20
      introProgress.current += introDelta
      if (introProgress.current > 1) introProgress.current = 1
      
      const p = introProgress.current;
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      modelRef.current.position.x = 2.4 * (1 - ease)
      modelRef.current.scale.setScalar(1.5 + (1.8 * (1 - ease)))
    } 
    
    const ptrX = charPointer ? charPointer.current.x : state.pointer.x;
    const ptrY = charPointer ? charPointer.current.y : state.pointer.y;

    if (modelRef.current && introProgress.current >= 0.35) {
      modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, ptrX * 0.12, 0.045)
      modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, -ptrY * 0.075, 0.04)
    }

    if (headRef.current && headBaseRotationRef.current && introProgress.current >= 0.45) {
      const base = headBaseRotationRef.current
      const targetY = base.y + state.pointer.x * 0.34
      const targetX = base.x - state.pointer.y * 0.18
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08)
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08)
    }
  })

  return <primitive ref={modelRef} object={clone} scale={1.5} position={[0, -0.1, 0]} />
}

useGLTF.preload('/character3d.glb?v=2')

export default function LandingPage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const starFieldRef = useRef<HTMLDivElement>(null)
  
  const mascotWrapRef = useRef<HTMLDivElement>(null)
  const mascotMaskRef = useRef<HTMLDivElement>(null) 
  const charPointerRef = useRef({ x: 0, y: 0 })

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const router = useRouter()
  const R = 160

  const isDark = theme === 'dark'
  const bgColor = isDark ? '#08080f' : '#f7f7fa'

  function updateMask(x: number, y: number) {
    if (!maskRef.current) return
    const bg = isDark ? '#04040a' : '#ffffff'
    maskRef.current.style.background =
      `radial-gradient(circle ${R}px at ${x}px ${y}px,transparent 0%,transparent ${R*0.1}px,${bg}40 ${R*0.4}px,${bg}80 ${R*0.8}px,${bg} ${R}px)`
  }

  useEffect(() => { updateMask(-9999, -9999) }, [theme])

  useEffect(() => {
    const sf = starFieldRef.current
    if (!sf) return
    sf.innerHTML = ''
    for (let i = 0; i < 120; i++) {
      const star = document.createElement('div')
      const size = Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 1.5 + 2
      star.style.cssText = `position:absolute;border-radius:50%;background:${isDark ? '#fff' : '#888'};width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:twinkle ${(Math.random()*3+2).toFixed(1)}s ease-in-out infinite;animation-delay:${(Math.random()*3).toFixed(1)}s;${size>2?`box-shadow:0 0 4px ${isDark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.15)'}`:''}` 
      sf.appendChild(star)
    }
  }, [theme])

  function handleMouseMove(e: React.MouseEvent) {
    const wrap = wrapRef.current
    if (!wrap) return
    const r = wrap.getBoundingClientRect()
    const mx = e.clientX - r.left
    const my = e.clientY - r.top

    updateMask(mx, my)

    if (ctaRef.current && shineRef.current) {
      const br = ctaRef.current.getBoundingClientRect()
      const inside = e.clientX>=br.left&&e.clientX<=br.right&&e.clientY>=br.top&&e.clientY<=br.bottom
      if (inside) {
        ctaRef.current.style.setProperty('--bx',((e.clientX-br.left)/br.width*100).toFixed(0)+'%')
        ctaRef.current.style.setProperty('--by',((e.clientY-br.top)/br.height*100).toFixed(0)+'%')
        shineRef.current.style.opacity='1'
      } else { shineRef.current.style.opacity='0' }
    }

    const mw = mascotWrapRef.current
    if (mw && mascotMaskRef.current) {
      const mr = mw.getBoundingClientRect()
      const lx = e.clientX - mr.left
      const ly = e.clientY - mr.top
      const inside = lx >= 0 && lx <= mr.width && ly >= 0 && ly <= mr.height
      
      mascotMaskRef.current.style.setProperty('--cx', lx + 'px')
      mascotMaskRef.current.style.setProperty('--cy', ly + 'px')
      mascotMaskRef.current.style.opacity = inside ? '1' : '0'

      const charCenterX = mr.left + mr.width / 2
      const charCenterY = mr.top + mr.height / 2

      charPointerRef.current.x = (e.clientX - charCenterX) / (window.innerWidth / 2)
      charPointerRef.current.y = -(e.clientY - charCenterY) / (window.innerHeight / 2)
    }
  }

  function handleMouseLeave() {
    if (shineRef.current) shineRef.current.style.opacity='0'
    if (mascotMaskRef.current) mascotMaskRef.current.style.opacity='0'
  }

  const radial1 = isDark ? '#1c1030' : '#ece8f5'
  const radial2 = isDark ? '#0a0a14' : '#f5f4f8'
  const radial3 = isDark ? '#04040a' : '#ffffff'
  const textPrimary = isDark ? '#fff' : '#0a0a14'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,20,0.5)'
  const textTertiary = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(10,10,20,0.35)'
  const borderStrong = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)'
  const navBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,20,0.03)'
  const blobBlend = isDark ? 'normal' : 'multiply' as React.CSSProperties['mixBlendMode']
  const blobOp1 = isDark ? 1 : 0.22
  const blobOp2 = isDark ? 1 : 0.18
  const badgeBg = isDark ? 'rgba(118,56,250,0.15)' : 'rgba(118,56,250,0.08)'
  const badgeBorder = isDark ? 'rgba(118,56,250,0.35)' : 'rgba(118,56,250,0.25)'
  const badgeText = isDark ? '#c4b0ff' : '#7638FA'

  const css = `
    @keyframes igShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes textGlow{0%,100%{opacity:0.55}50%{opacity:0.9}}
    @keyframes p1{0%{top:20%;left:20%}25%{top:10%;left:55%}50%{top:40%;left:70%}75%{top:60%;left:30%}100%{top:20%;left:20%}}
    @keyframes p2{0%{top:60%;left:70%}25%{top:80%;left:30%}50%{top:50%;left:10%}75%{top:20%;left:50%}100%{top:60%;left:70%}}
    @keyframes p3{0%{top:80%;left:40%}25%{top:50%;left:80%}50%{top:20%;left:60%}75%{top:40%;left:10%}100%{top:80%;left:40%}}
    @keyframes p4{0%{top:30%;left:80%}25%{top:70%;left:60%}50%{top:85%;left:20%}75%{top:10%;left:30%}100%{top:30%;left:80%}}
    @keyframes p5{0%{top:50%;left:50%}25%{top:20%;left:20%}50%{top:70%;left:80%}75%{top:80%;left:40%}100%{top:50%;left:50%}}
    @keyframes starRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes twinkle{0%,100%{opacity:0.25}50%{opacity:1}}
    .ig-text{background:linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA,#FFD600);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:igShift 4s ease infinite;}
    .ig-text-glow{background:linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA,#FFD600);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:igShift 4s ease infinite,textGlow 4s ease infinite;filter:blur(9px);position:absolute;inset:0;pointer-events:none;mix-blend-mode:${isDark?'screen':'normal'};}
    .feat-card{background:${isDark?'rgba(255,255,255,0.05)':'rgba(10,10,20,0.03)'};border:0.5px solid ${isDark?'rgba(255,255,255,0.1)':'rgba(10,10,20,0.1)'};border-radius:12px;padding:16px;backdrop-filter: blur(16px) ${isDark ? '' : 'brightness(1.5) contrast(1.15)'};-webkit-backdrop-filter: blur(16px) ${isDark ? '' : 'brightness(1.5) contrast(1.15)'};transition:background 0.3s,border-color 0.3s;}
    .feat-card:hover{background:${isDark?'rgba(255,255,255,0.09)':'rgba(10,10,20,0.06)'};border-color:${isDark?'rgba(255,255,255,0.18)':'rgba(10,10,20,0.18)'};}
    #star-field{position:absolute;width:200%;height:200%;top:-50%;left:-50%;animation:starRotate 240s linear infinite;pointer-events:none;z-index:8;}
    .blob{position:absolute;border-radius:50%;transform:translate(-50%,-50%);}
    @media (max-width: 1024px) {
      .mascot-abs { display:block!important;width:58%!important;right:-4%!important;top:10%!important;bottom:-6%!important; }
    }
    @media (max-width: 760px) {
      .mascot-abs { width:90%!important;right:-18%!important;top:32%!important;bottom:-10%!important;opacity:0.95; }
    }
    @media (max-width: 520px) {
      .mascot-abs { width:125%!important;right:-25%!important;top:40%!important;bottom:-15%!important;opacity:0.9; }
    }
    .animate-cinematic-blur { animation: cinematicBlur 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes cinematicBlur {
      0% { filter: blur(30px); opacity: 0; }
      6% { opacity: 1; }
      100% { filter: blur(0px); opacity: 1; }
    }
    @keyframes fadeInMain {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @media(max-width:640px){.hero-text{padding-left:16px!important;padding-right:16px!important;}}
    @media(max-width:760px){
      .hero-text{max-width:86%!important;}
      .hero-badge,.hero-cta{white-space:nowrap;}
      .hero-copy{max-width:420px;}
    }
    @media(max-width:520px){
      .hero-text{max-width:96%!important;padding-bottom:28px!important;}
      .hero-badge{font-size:10px!important;padding:4px 10px!important;max-width:calc(100vw - 48px);}
      .hero-cta{min-width:0;width:auto;max-width:calc(100vw - 64px);padding-left:18px!important;padding-right:18px!important;}
      .hero-copy{max-width:62%;}
    }
  `

  return (
    <>
      <style>{css}</style>
      <div
        ref={wrapRef}
        data-theme={theme}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{animation: 'fadeInMain 5s ease-in-out forwards', minHeight:'100vh',background:bgColor,position:'relative',display:'flex',flexDirection:'column',transition:'background 0.4s',overflow:'hidden'}}
      >
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 80% 70% at 50% 45%,${radial1} 0%,${radial2} 45%,${radial3} 100%)`,zIndex:0,transition:'background 0.4s'}}/>

        <div style={{position:'absolute',inset:0,zIndex:1,overflow:'hidden',mixBlendMode:blobBlend}}>
          <div className="blob" style={{width:'70%',height:'70%',filter:'blur(80px)',background:'#FFD600',opacity:blobOp1,animation:'p1 14s ease-in-out infinite'}}/>
          <div className="blob" style={{width:'65%',height:'65%',filter:'blur(80px)',background:'#FF0069',opacity:blobOp1,animation:'p2 17s ease-in-out infinite'}}/>
          <div className="blob" style={{width:'60%',height:'60%',filter:'blur(80px)',background:'#7638FA',opacity:blobOp2,animation:'p3 13s ease-in-out infinite'}}/>
          <div className="blob" style={{width:'55%',height:'55%',filter:'blur(75px)',background:'#D300C5',opacity:blobOp2,animation:'p4 19s ease-in-out infinite'}}/>
          <div className="blob" style={{width:'50%',height:'50%',filter:'blur(70px)',background:'#FF7A00',opacity:blobOp1,animation:'p5 11s ease-in-out infinite'}}/>
          <div ref={maskRef} style={{position:'absolute',inset:0,transition:'background 0.4s'}}/>
        </div>

        <div ref={starFieldRef} id="star-field"/>

        {/* 3D CHARACTER SECTION */}
        <div
          ref={mascotWrapRef}
          className="mascot-abs animate-cinematic-blur"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '46%',
            zIndex: 6,
            pointerEvents: 'none', 
          }}
        >
        {/* Canvas 1: Default */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <Canvas 
              eventSource={typeof window !== 'undefined' ? document.body : undefined} 
              camera={{ position: [0, 0, 4.0], fov: 45 }} 
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <ambientLight intensity={1.2} />
              <directionalLight position={[5, 8, 5]} intensity={1.0} />
              <Suspense fallback={null}>
                <MascotModel isWhiteDiffuse={false} charPointer={charPointerRef} />
              </Suspense>
            </Canvas>
          </div>

          {/* Canvas 2: White Diffuse Masked */}
          <div
            ref={mascotMaskRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              opacity: 0, 
              transition: 'opacity 0.2s',
              WebkitMaskImage: 'radial-gradient(circle 180px at var(--cx, 50%) var(--cy, 50%), black 0%, transparent 100%)',
              maskImage: 'radial-gradient(circle 180px at var(--cx, 50%) var(--cy, 50%), black 0%, transparent 100%)',
            }}
          >
            <Canvas 
              eventSource={typeof window !== 'undefined' ? document.body : undefined} 
              camera={{ position: [0, 0, 4.0], fov: 45 }} 
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <ambientLight intensity={1.6} />
              <directionalLight position={[5, 8, 5]} intensity={2.0} />
              <Suspense fallback={null}>
                <MascotModel isWhiteDiffuse={true} charPointer={charPointerRef} />
              </Suspense>
            </Canvas>
          </div>
        </div>
        
        {/* CONTENT */}
        <div style={{padding:'10px 12px 0',position:'relative',zIndex:10,flexShrink:0}}>
          <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 18px',borderRadius:12,border:`0.5px solid ${borderStrong}`,backdropFilter:'blur(16px)',background:navBg,transition:'all 0.3s'}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <svg width="15" height="15" viewBox="0 0 500 420" fill={textPrimary} style={{transition:'fill 0.3s'}}>
                <path d="M209.73,104.87c0,11.58-9.39,20.97-20.97,20.97h-62.92v62.92c0,11.58-9.39,20.97-20.97,20.97-11.58,0-20.97-9.39-20.97-20.97v-62.92H20.97C9.39,125.84,0,116.45,0,104.87c0-11.58,9.39-20.97,20.97-20.97h62.92V20.97C83.89,9.39,93.28,0,104.86,0c11.58,0,20.97,9.39,20.97,20.97v62.93h62.92c11.58,0,20.97,9.39,20.97,20.97Z"/>
                <path d="M440.43,356.53v10.5c0,5.79-4.69,10.48-10.48,10.48-5.79,0-10.48-4.69-10.48-10.48-0-5.79-4.7-10.49-10.49-10.49-5.79,0-10.49,4.7-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-10.49c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-31.46c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v41.94c0,28.96-23.48,52.43-52.43,52.43-28.96,0-52.43-23.48-52.43-52.43v-136.32c0-11.58,9.39-20.97,20.97-20.97,11.58,0,20.97,9.39,20.97,20.97v136.32c0,5.79,4.69,10.48,10.48,10.48,5.79,0,10.48-4.69,10.48-10.48v-52.43c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94v31.46c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.95,41.95-41.95,23.17,0,41.95,18.78,41.95,41.95v10.49c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94Z"/>
              </svg>
              <span style={{fontSize:12,fontWeight:500,color:textPrimary,transition:'color 0.3s'}}>freehandtools</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,height:32}}>
              <a
                href="mailto:freehandtools@gmail.com"
                style={{display:'inline-flex',alignItems:'center',gap:6,height:32,boxSizing:'border-box',background:cardBg,border:`0.5px solid ${borderStrong}`,borderRadius:8,padding:'0 14px',fontSize:11,color:textPrimary,cursor:'pointer',transition:'all 0.3s',textDecoration:'none'}}
              >
                <i className="ti ti-message" style={{fontSize:13}}/>
                Hubungi Kami
              </a>
              <button
                onClick={()=>setTheme(isDark?'light':'dark')}
                style={{width:32,height:32,boxSizing:'border-box',borderRadius:8,border:`0.5px solid ${borderStrong}`,background:isDark?'rgba(255,255,255,0.1)':'rgba(10,10,20,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:textPrimary,fontSize:16,transition:'all 0.2s'}}
              >
                <i className={isDark?'ti ti-moon':'ti ti-sun'}/>
              </button>
            </div>
          </nav>
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'flex-start',position:'relative',zIndex:7}}>
          <div className="hero-text" style={{marginTop: 'max(4vh, calc((100vw - 760px) * 0.45))',paddingLeft:44,paddingRight:32,paddingBottom:40,maxWidth:'52%'}}>
            <div className="hero-badge" style={{display:'inline-flex',alignItems:'center',gap:6,background:badgeBg,border:`0.5px solid ${badgeBorder}`,borderRadius:20,padding:'4px 12px',fontSize:11,color:badgeText,marginBottom:16,transition:'all 0.3s',alignSelf:'flex-start'}}>
              <i className="ti ti-sparkles" style={{fontSize:12}}/>
              Beta · Terbatas 50 pengguna pertama
            </div>

            <h1 style={{fontSize:32,fontWeight:900,color:textPrimary,lineHeight:1.25,margin:'0 0 12px',letterSpacing:'-0.5px',transition:'color 0.3s',textAlign:'left',fontFamily:'var(--font-geist-sans), sans-serif',whiteSpace:'nowrap'}}>
              Semua insight Instagram<br/>kamu,{' '}
              <span style={{position:'relative',display:'inline-block'}}>
                <span className="ig-text">dalam satu tempat.</span>
                <span className="ig-text-glow" aria-hidden="true">dalam satu tempat.</span>
              </span>
            </h1>

            <p className="hero-copy" style={{fontSize:13,color:textSecondary,lineHeight:1.65,margin:'0 0 24px',transition:'color 0.3s',textAlign:'left'}}>
              Tidak perlu bayar. Tidak perlu install.<br/>Cukup connect, data langsung masuk.
            </p>

            <div style={{display:'flex',justifyContent:'flex-start'}}>
              <button
                className="hero-cta"
                ref={ctaRef}
                onClick={()=>router.push('/auth')}
                style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA)',backgroundSize:'250% 100%',animation:'igShift 3s ease infinite',border:'none',borderRadius:22,padding:'11px 24px',fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer',position:'relative',overflow:'hidden'}}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.982c2.937 0 3.285.011 4.445.064a6.087 6.087 0 0 1 2.042.379 3.408 3.408 0 0 1 1.265.823 3.408 3.408 0 0 1 .823 1.265 6.087 6.087 0 0 1 .379 2.042c.053 1.16.064 1.508.064 4.445s-.011 3.285-.064 4.445a6.087 6.087 0 0 1-.379 2.042 3.643 3.643 0 0 1-2.088 2.088 6.087 6.087 0 0 1-2.042.379c-1.16.053-1.508.064-4.445.064s-3.285-.011-4.445-.064a6.087 6.087 0 0 1-2.043-.379 3.408 3.408 0 0 1-1.264-.823 3.408 3.408 0 0 1-.823-1.265 6.087 6.087 0 0 1-.379-2.042c-.053-1.16-.064-1.508-.064-4.445s.011-3.285.064-4.445a6.087 6.087 0 0 1 .379-2.042 3.408 3.408 0 0 1 .823-1.265 3.408 3.408 0 0 1 1.265-.823 6.087 6.087 0 0 1 2.042-.379c1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066a8.074 8.074 0 0 0-2.67.511 5.392 5.392 0 0 0-1.949 1.27 5.392 5.392 0 0 0-1.269 1.948 8.074 8.074 0 0 0-.51 2.67C1.012 8.638 1 9.013 1 12s.013 3.362.066 4.535a8.074 8.074 0 0 0 .511 2.67 5.392 5.392 0 0 0 1.27 1.949 5.392 5.392 0 0 0 1.948 1.269 8.074 8.074 0 0 0 2.67.51C8.638 22.988 9.013 23 12 23s3.362-.013 4.535-.066a8.074 8.074 0 0 0 2.67-.511 5.625 5.625 0 0 0 3.218-3.218 8.074 8.074 0 0 0 .51-2.67C22.988 15.362 23 14.987 23 12s-.013-3.362-.066-4.535a8.074 8.074 0 0 0-.511-2.67 5.392 5.392 0 0 0-1.27-1.949 5.392 5.392 0 0 0-1.948-1.269 8.074 8.074 0 0 0-2.67-.51C15.362 1.012 14.987 1 12 1Zm0 5.351A5.649 5.649 0 1 0 17.649 12 5.649 5.649 0 0 0 12 6.351Zm0 9.316A3.667 3.667 0 1 1 15.667 12 3.667 3.667 0 0 1 12 15.667Zm5.872-10.859a1.32 1.32 0 1 0 1.32 1.32 1.32 1.32 0 0 0-1.32-1.32Z"/>
                </svg>
                Connect Instagram — Gratis
                <div ref={shineRef} style={{position:'absolute',inset:0,background:'radial-gradient(circle at var(--bx,50%) var(--by,50%),rgba(255,255,255,0.28),transparent 60%)',opacity:0,transition:'opacity 0.2s',pointerEvents:'none',borderRadius:22}}/>
              </button>
            </div>

            <p style={{fontSize:11,color:textTertiary,margin:'10px 0 0',transition:'color 0.3s',textAlign:'left'}}>
              Hanya baca data. Tidak bisa posting atas nama kamu.
            </p>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,padding:'0 12px 12px',position:'relative',zIndex:7}}>
          {[
            {icon:'ti-layout-dashboard',title:'Overview',desc:'Metrik akun & pertumbuhan follower dalam satu layar'},
            {icon:'ti-photo',title:'Konten',desc:'Ranking & skor tiap post dan reel berdasarkan performa nyata'},
            {icon:'ti-bulb',title:'AI Insights',desc:'Analisis blind spot dan ide konten otomatis dari AI'},
          ].map((f,i)=>(
            <div key={i} className="feat-card">
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
                <i className={`ti ${f.icon}`} style={{fontSize:15,color:textSecondary}}/>
                <span style={{fontSize:12,fontWeight:500,color:textPrimary,transition:'color 0.3s'}}>{f.title}</span>
              </div>
              <div style={{fontSize:11,color:textTertiary,lineHeight:1.55,transition:'color 0.3s'}}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',padding:'0 12px 16px',position:'relative',zIndex:7}}>
          <p style={{fontSize:'11px',margin:0,color:isDark?'rgba(255,255,255,0.45)':'rgba(10,10,20,0.5)'}}>
            <a href="/privacy" style={{color:'inherit',textDecoration:'none'}}>Kebijakan Privasi</a>
            <span style={{color:isDark?'#c4b0ff':'#7638FA',margin:'0 8px'}}>✦</span>
            <a href="/terms" style={{color:'inherit',textDecoration:'none'}}>Syarat Layanan</a>
          </p>
        </div>
      </div>
    </>
  )
}
