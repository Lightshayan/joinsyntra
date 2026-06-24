import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

const S = '#E3C29B', B = '#F5F2EB', C = '#0a0a0a';

// ── Hook: window size ─────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(375);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ── Earth ─────────────────────────────────────────────────
function Earth({ scrollY }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#2d5a27';
    [[100,80,200,180],[320,60,280,200],[620,100,160,220],
     [780,120,120,160],[200,280,180,120],[400,300,100,80],
     [500,260,140,160],[700,300,80,100],[150,380,100,60]
    ].forEach(([x,y,w,h]) => {
      ctx.beginPath();
      ctx.ellipse(x,y,w/2,h/2,0.3,0,Math.PI*2);
      ctx.fill();
    });
    ctx.fillStyle = '#cce8f0';
    ctx.fillRect(0,0,1024,28);
    ctx.fillRect(0,484,1024,28);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollY.current;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.scale.setScalar(Math.max(0.7, 1 - s * 0.0008));
      meshRef.current.position.x = isMobile ? 0 : 2.8 - s * 0.003;
      meshRef.current.position.y = s * 0.001;
    }
    if (glowRef.current) {
      glowRef.current.position.x = isMobile ? 0 : 2.8 - s * 0.003;
      glowRef.current.position.y = s * 0.001;
    }
  });

  return (
    <group>
      <mesh ref={glowRef} position={[isMobile ? 0 : 2.8, 0, 0]} scale={[1.12,1.12,1.12]}>
        <sphereGeometry args={[1.8,32,32]} />
        <meshStandardMaterial color="#4a9fc8" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      <mesh ref={meshRef} position={[isMobile ? 0 : 2.8, 0, 0]}>
        <sphereGeometry args={[1.8,64,64]} />
        <meshStandardMaterial map={earthTexture} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Scene({ scrollY }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5,3,5]} intensity={1.4} color="#fff8f0" />
      <directionalLight position={[-8,-4,-6]} intensity={0.2} color="#3a6fa8" />
      <Stars radius={300} depth={60} count={2500} factor={4} fade speed={0.4} />
      <Suspense fallback={null}><Earth scrollY={scrollY} /></Suspense>
    </>
  );
}

// ── Nav ───────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <motion.nav initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}}
      style={{position:'fixed',top:0,left:0,right:0,zIndex:200,padding:'20px 0',
        background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition:'background 0.4s,border-color 0.4s'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <img src="/Syntra.png" alt="Syntra" style={{height:22,objectFit:'contain'}} onError={e=>e.target.style.display='none'} />
        <div style={{display:'flex',gap:28,fontSize:13,fontWeight:500,color:B,opacity:0.65}}>
          {['Events','Volunteer','Partner','Resources'].map(l=>(
            <a key={l} href={`${l.toLowerCase()}.html`} style={{color:'inherit',textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e=>e.target.style.color=S} onMouseLeave={e=>e.target.style.color=B}>{l}</a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

// ── Fade ──────────────────────────────────────────────────
const Fade = ({children,delay=0}) => (
  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
    viewport={{once:true,margin:'-60px'}} transition={{duration:0.6,delay,ease:[0.22,1,0.36,1]}}>
    {children}
  </motion.div>
);

// ── Service Card ──────────────────────────────────────────
function SCard({title,body,special}) {
  const [hov,setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      background: special ? 'rgba(227,194,155,0.05)' : 'rgba(255,255,255,0.03)',
      border:`1px solid ${hov?(special?'rgba(227,194,155,0.4)':'rgba(255,255,255,0.18)'):(special?'rgba(227,194,155,0.2)':'rgba(255,255,255,0.07)')}`,
      borderRadius:16,padding:28,transform:hov?'translateY(-4px)':'none',transition:'all 0.25s',cursor:'default',height:'100%'
    }}>
      {special && <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',
        background:'rgba(227,194,155,0.15)',color:S,padding:'3px 10px',borderRadius:9999,display:'inline-block',marginBottom:10}}>Select Events</span>}
      <h3 style={{fontSize:15,fontWeight:700,color:special?S:B,marginBottom:8}}>{title}</h3>
      <p style={{fontSize:13,opacity:0.48,lineHeight:1.75,margin:0}}>{body}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function App() {
  const scrollY = useRef(0);
  const w = useWindowWidth();
  const mob = w < 768;
  const {scrollYProgress} = useScroll();
  const heroOpacity = useTransform(scrollYProgress,[0,0.18],[1,0]);
  const heroY = useTransform(scrollYProgress,[0,0.18],[0,-50]);

  useEffect(() => {
    const h = () => { scrollY.current = window.scrollY; };
    window.addEventListener('scroll', h, {passive:true});
    return () => window.removeEventListener('scroll', h);
  }, []);

  const services = [
    {title:'Health Screenings',body:'Blood pressure, glucose, BMI, and more — results on the spot, no labs required.'},
    {title:'Mental Health Check-In',body:'Standardized screeners with trained volunteers and direct referrals to local resources.'},
    {title:'Vision Screening',body:'Basic acuity tests to flag undiagnosed issues before they worsen.'},
    {title:'Resource Navigation',body:'Free clinics, insurance enrollment, food access, and pharmacy programs — all in one place.'},
    {title:'Health Education',body:'Workshops and materials to help communities manage their health long-term.'},
    {title:'Specialty Events',body:'Focused events for dental, women\'s health, pediatrics, and more — deployed based on community-specific need.',special:true},
  ];

  const btn = (href,label,primary) => (
    <a href={href} style={{
      background:primary?S:'transparent',color:primary?C:B,
      fontWeight:primary?700:600,fontSize:14,padding:'13px 26px',borderRadius:12,
      textAlign:'center',display:'inline-block',
      border:primary?'none':'1px solid rgba(255,255,255,0.15)',
      transition:'opacity 0.2s,transform 0.2s',
    }} onMouseEnter={e=>{e.currentTarget.style.opacity='0.85';e.currentTarget.style.transform='translateY(-2px)'}}
       onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='none'}}>{label}</a>
  );

  return (
    <div style={{background:C,color:B,fontFamily:"system-ui,-apple-system,sans-serif",overflowX:'hidden'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        ::selection{background:${S};color:${C}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:rgba(227,194,155,0.3);border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes sa{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
      `}</style>

      <Nav />

      {/* Hero */}
      <div style={{position:'relative',height:'100vh',minHeight:600,overflow:'hidden'}}>
        <Canvas style={{position:'absolute',inset:0}} camera={{position:[0,0,6],fov:45}} dpr={[1,2]}>
          <Scene scrollY={scrollY} />
        </Canvas>
        <motion.div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',opacity:heroOpacity,y:heroY}}>
          <div style={{maxWidth:1100,margin:'0 auto',padding:mob?'0 1.5rem':'0 2rem',width:'100%'}}>
            <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.5}}
              style={{maxWidth:mob?'100%':520}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,border:`1px solid rgba(227,194,155,0.3)`,
                color:S,fontSize:11,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
                padding:'6px 16px',borderRadius:9999,marginBottom:28}}>
                <span style={{width:6,height:6,background:S,borderRadius:'50%',animation:'pulse 2s infinite',flexShrink:0}}/>
                Always Free
              </div>
              <h1 style={{fontSize:mob?40:66,fontWeight:900,lineHeight:1.05,letterSpacing:'-0.03em',marginBottom:20}}>
                Healthcare.<br/>
                <span style={{background:`linear-gradient(135deg,${B},${S})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                  Where it's missing.
                </span>
              </h1>
              <p style={{fontSize:mob?15:17,opacity:0.55,maxWidth:430,lineHeight:1.8,marginBottom:32}}>
                Syntra deploys free pop-up health screenings into communities that need them most. No insurance. No appointment. Walk in.
              </p>
              <div style={{display:'flex',gap:12,flexDirection:mob?'column':'row',maxWidth:mob?260:'none'}}>
                {btn('events.html','See Upcoming Events',true)}
                {btn('volunteer.html','Get Involved',false)}
              </div>
            </motion.div>
          </div>
        </motion.div>
        {!mob && <div style={{position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',
          display:'flex',flexDirection:'column',alignItems:'center',gap:8,opacity:0.22,
          fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase'}}>
          <div style={{width:1,height:36,background:`linear-gradient(to bottom,${B},transparent)`,animation:'sa 1.6s infinite'}}/>
          Scroll
        </div>}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:160,
          background:`linear-gradient(to top,${C},transparent)`,pointerEvents:'none'}}/>
      </div>

      {/* Strip */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.015)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:mob?'2.5rem 1.5rem':'3rem 2rem'}}>
          <Fade>
            <div style={{display:'grid',gridTemplateColumns:mob?'1fr 1fr':'repeat(4,1fr)',gap:mob?'2rem 1.5rem':'2rem'}}>
              {[{v:'Free',l:'No cost, ever',a:true},{v:'Walk-In',l:'No appointment'},{v:'Multi-City',l:'Expanding'},{v:'Community',l:'Built for access'}]
                .map(({v,l,a})=>(
                <div key={v}>
                  <div style={{fontSize:mob?24:30,fontWeight:800,color:a?S:B,marginBottom:4}}>{v}</div>
                  <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',opacity:0.38}}>{l}</div>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </div>

      {/* Services */}
      <Sec label="Services" title="What we offer." mob={mob}>
        <p style={{fontSize:14,opacity:0.52,lineHeight:1.8,maxWidth:460,marginBottom:40}}>
          Services vary by event and community need. Check individual event pages for what's available.
        </p>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':w<1024?'1fr 1fr':'repeat(3,1fr)',gap:12}}>
          {services.map((s,i)=><Fade key={s.title} delay={i*0.06}><SCard {...s}/></Fade>)}
        </div>
      </Sec>

      {/* How it works */}
      <Sec label="How It Works" title="Walk in. Walk out healthier." alt mob={mob}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:mob?28:44,marginTop:8}}>
          {[{n:'1',h:'Find an event.',b:'Check our events page for upcoming locations and available services. Pre-register to help us prepare.'},
            {n:'2',h:'Check in. Move through.',b:'Register at the door, move through stations at your own pace, and get results before you leave.'},
            {n:'3',h:'Get connected.',b:'Anything flagged gets a referral to local care. You leave knowing your numbers and your next step.'}
          ].map((s,i)=>(
            <Fade key={s.n} delay={i*0.1}>
              <div style={{display:'flex',gap:18,alignItems:'flex-start'}}>
                <div style={{width:34,height:34,border:`1px solid rgba(227,194,155,0.28)`,borderRadius:'50%',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:S,flexShrink:0}}>
                  {s.n}
                </div>
                <div>
                  <h3 style={{fontSize:15,fontWeight:700,marginBottom:7}}>{s.h}</h3>
                  <p style={{fontSize:13,opacity:0.48,lineHeight:1.75}}>{s.b}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </Sec>

      {/* Need stats */}
      <div style={{background:'rgba(227,194,155,0.04)',borderTop:'1px solid rgba(227,194,155,0.1)',borderBottom:'1px solid rgba(227,194,155,0.1)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:mob?'3rem 1.5rem':'5rem 2rem'}}>
          <Fade>
            <div style={{textAlign:'center',marginBottom:44}}>
              <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:S,marginBottom:10}}>The Need</div>
              <h2 style={{fontSize:mob?24:34,fontWeight:800,letterSpacing:'-0.02em'}}>Why this matters.</h2>
            </div>
          </Fade>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr 1fr':'repeat(4,1fr)',gap:32,textAlign:'center'}}>
            {[{n:'25M+',l:'Uninsured Americans'},{n:'1 in 3',l:'Adults with undetected hypertension'},
              {n:'96M',l:'US adults with prediabetes'},{n:'50%',l:'Of mental illness goes untreated'}
            ].map((s,i)=>(
              <Fade key={s.n} delay={i*0.08}>
                <div>
                  <div style={{fontSize:mob?28:40,fontWeight:900,color:S,marginBottom:6}}>{s.n}</div>
                  <div style={{fontSize:12,opacity:0.44,lineHeight:1.55}}>{s.l}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <Sec label="Mission" title={<>The system wasn't built<br/>for everyone.</>} mob={mob}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:mob?36:72,alignItems:'center'}}>
          <Fade>
            <p style={{fontSize:15,opacity:0.55,lineHeight:1.85,marginBottom:14}}>
              Millions go unscreened every year — not from lack of care, but lack of access. Syntra deploys directly into those communities, removing every barrier we can.
            </p>
            <p style={{fontSize:15,opacity:0.55,lineHeight:1.85}}>Student-led. Volunteer-powered. Community-driven.</p>
          </Fade>
          <Fade delay={0.12}>
            <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:28}}>
              {[{l:'Who we serve',v:'Uninsured and underinsured individuals, immigrant communities, low-income families, and anyone without routine access to care.'},
                {l:'Who runs it',v:'Student founders, trained volunteers, community health workers, and partner organizations.'},
                {l:'Cost to you',v:'Nothing. Every event is completely free.',accent:true}
              ].map((f,i,arr)=>(
                <div key={f.l} style={{padding:'18px 0',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                  <div style={{fontFamily:'monospace',fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',opacity:0.3,marginBottom:5}}>{f.l}</div>
                  <p style={{fontSize:14,opacity:f.accent?1:0.68,lineHeight:1.65,fontWeight:f.accent?700:400,color:f.accent?S:B}}>{f.v}</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </Sec>

      {/* CTA */}
      <Sec alt mob={mob}>
        <Fade>
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:20,padding:mob?'2.5rem 1.75rem':'4.5rem',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',width:380,height:380,right:-80,bottom:-80,
              background:'rgba(227,194,155,0.07)',borderRadius:'50%',filter:'blur(80px)',pointerEvents:'none'}}/>
            <div style={{position:'relative',zIndex:1,maxWidth:460}}>
              <span style={{display:'inline-block',background:S,color:C,fontSize:9,fontWeight:800,
                letterSpacing:'0.2em',textTransform:'uppercase',padding:'4px 12px',borderRadius:9999,marginBottom:18}}>
                Now Recruiting
              </span>
              <h2 style={{fontSize:mob?26:38,fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>Get involved.</h2>
              <p style={{fontSize:15,opacity:0.55,lineHeight:1.8,marginBottom:28}}>
                We're building a team of volunteers, community partners, and organizations ready to bring free screenings to people who need them.
              </p>
              <div style={{display:'flex',gap:12,flexDirection:mob?'column':'row',maxWidth:mob?260:'none'}}>
                {btn('volunteer.html','Join as Volunteer',true)}
                {btn('partner.html','Partner With Us',false)}
              </div>
            </div>
          </div>
        </Fade>
      </Sec>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'2rem 0'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:S}}>Screen • Refer • Connect</div>
          <div style={{display:'flex',gap:20,fontSize:11,opacity:0.4}}>
            <a href="https://www.linkedin.com/company/joinsyntra/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/joinsyntra/" target="_blank" rel="noreferrer">Instagram</a>
            <span>© 2026 Syntra.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Sec({label,title,children,alt,mob}) {
  return (
    <div style={{background:alt?'rgba(255,255,255,0.015)':'transparent',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        {label && <Fade><div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:S,marginBottom:10}}>{label}</div></Fade>}
        {title && <Fade delay={0.05}><h2 style={{fontSize:mob?24:32,fontWeight:800,letterSpacing:'-0.02em',lineHeight:1.2,marginBottom:14}}>{title}</h2></Fade>}
        {children}
      </div>
    </div>
  );
}
