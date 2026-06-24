import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useTexture, OrbitControls } from '@react-three/drei';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── Colors ──────────────────────────────────────────────
const S = '#E3C29B', B = '#F5F2EB', C = '#0a0a0a';

// ── Earth ────────────────────────────────────────────────
function Earth({ scrollY }) {
  const meshRef = useRef();
  const cloudsRef = useRef();
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  const [earthMap, cloudsMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-clouds.png',
  ]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      // scroll-driven zoom + tilt
      const s = scrollY.current;
      const scale = Math.max(0.7, 1 - s * 0.0008);
      meshRef.current.scale.setScalar(scale);
      meshRef.current.position.x = isMobile ? 0 : 2.8 - s * 0.003;
      meshRef.current.position.y = s * 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.1;
      cloudsRef.current.rotation.x = t * 0.02;
    }
  });

  return (
    <group>
      {/* Atmosphere glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          color="#4a8fa8"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Earth */}
      <mesh ref={meshRef} position={[isMobile ? 0 : 2.8, 0, 0]}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial map={earthMap} />
      </mesh>
      {/* Clouds */}
      <mesh ref={cloudsRef} position={[isMobile ? 0 : 2.8, 0, 0]} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Scene ─────────────────────────────────────────────────
function Scene({ scrollY }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} color="#fff8f0" />
      <directionalLight position={[-8, -4, -6]} intensity={0.2} color="#3a6fa8" />
      <Stars radius={300} depth={60} count={3000} factor={4} fade speed={0.5} />
      <Suspense fallback={null}>
        <Earth scrollY={scrollY} />
      </Suspense>
    </>
  );
}

// ── Fade-in wrapper ────────────────────────────────────────
const Fade = ({ children, delay = 0, y = 24 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// ── Pill ──────────────────────────────────────────────────
const Pill = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    border: `1px solid rgba(227,194,155,0.35)`, color: S,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
    textTransform: 'uppercase', padding: '6px 16px',
    borderRadius: 9999, marginBottom: 28
  }}>
    <span style={{ width: 6, height: 6, background: S, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
    {children}
  </span>
);

// ── Nav ───────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '20px 0',
        background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'background 0.4s, border-color 0.4s',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/Syntra.png" alt="Syntra" style={{ height: 22, objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 32, fontSize: 13, fontWeight: 500, color: B, opacity: 0.65 }}>
          {['Events', 'Volunteer', 'Partner', 'Resources'].map(l => (
            <a key={l} href={`${l.toLowerCase()}.html`}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s, opacity 0.2s' }}
              onMouseEnter={e => { e.target.style.color = S; e.target.style.opacity = 1; }}
              onMouseLeave={e => { e.target.style.color = B; e.target.style.opacity = 0.65; }}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

// ── Service Card ──────────────────────────────────────────
function SCard({ title, body, special }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: special ? 'rgba(227,194,155,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? (special ? 'rgba(227,194,155,0.4)' : 'rgba(255,255,255,0.18)') : (special ? 'rgba(227,194,155,0.2)' : 'rgba(255,255,255,0.07)')}`,
        borderRadius: 16, padding: 28,
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
    >
      {special && (
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
          background: 'rgba(227,194,155,0.15)', color: S,
          padding: '3px 10px', borderRadius: 9999, display: 'inline-block', marginBottom: 10
        }}>Select Events</span>
      )}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: special ? S : B, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, opacity: 0.48, lineHeight: 1.75 }}>{body}</p>
    </div>
  );
}

// ── Stat ──────────────────────────────────────────────────
function Stat({ val, label, accent }) {
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent ? S : B, marginBottom: 4 }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.38 }}>{label}</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const scrollY = useRef(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -60]);

  useEffect(() => {
    const h = () => { scrollY.current = window.scrollY; };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const services = [
    { title: 'Health Screenings', body: 'Blood pressure, glucose, BMI, and more — on-the-spot results. No labs, no prior visit required.' },
    { title: 'Mental Health Check-In', body: 'Standardized screeners with trained volunteers and direct referrals to local mental health resources.' },
    { title: 'Vision Screening', body: 'Basic acuity checks to flag undiagnosed vision issues before they become serious.' },
    { title: 'Resource Navigation', body: 'Free clinics, insurance enrollment, food access, pharmacy programs — all mapped and handed to you.' },
    { title: 'Health Education', body: 'Workshops and materials that help communities understand and manage their health long-term.' },
    { title: 'Specialty Events', body: 'Focused events for dental, women\'s health, pediatrics, and more — deployed based on community-specific need.', special: true },
  ];

  const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const isMobile = W < 768;

  return (
    <div style={{ background: C, color: B, fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes scrollAnim { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }
        ::selection{background:${S};color:${C}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:rgba(227,194,155,0.3);border-radius:2px}
        a{color:inherit;text-decoration:none}
      `}</style>

      <Nav />

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        <Canvas
          style={{ position: 'absolute', inset: 0 }}
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={Math.min(window.devicePixelRatio, 2)}
        >
          <Scene scrollY={scrollY} />
        </Canvas>

        <motion.div
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            opacity: heroOpacity, y: heroY,
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 1.5rem' : '0 2rem', width: '100%' }}>
            <div style={{ maxWidth: isMobile ? '100%' : 560 }}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                <Pill>Always Free</Pill>
                <h1 style={{
                  fontSize: isMobile ? 42 : 68, fontWeight: 900,
                  lineHeight: 1.04, letterSpacing: '-0.03em', marginBottom: 24
                }}>
                  Healthcare.<br />
                  <span style={{
                    background: `linear-gradient(135deg, ${B} 0%, ${S} 100%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                  }}>Where it's missing.</span>
                </h1>
                <p style={{ fontSize: isMobile ? 15 : 17, opacity: 0.55, maxWidth: 440, lineHeight: 1.8, marginBottom: 36 }}>
                  Syntra deploys free pop-up health screenings into communities that need them most. No insurance. No appointment. Walk in.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', maxWidth: isMobile ? 280 : 'none' }}>
                  <a href="events.html" style={{
                    background: S, color: C, fontWeight: 700, fontSize: 14,
                    padding: '14px 28px', borderRadius: 12, textAlign: 'center',
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.opacity = 0.85; e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.target.style.opacity = 1; e.target.style.transform = 'none'; }}>
                    See Upcoming Events
                  </a>
                  <a href="volunteer.html" style={{
                    border: '1px solid rgba(255,255,255,0.15)', color: B, fontWeight: 600, fontSize: 14,
                    padding: '14px 28px', borderRadius: 12, textAlign: 'center',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.transform = 'none'; }}>
                    Get Involved
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: 0.25, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase'
        }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${B}, transparent)`, animation: 'scrollAnim 1.6s infinite' }} />
          Scroll
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to top, ${C}, transparent)`, pointerEvents: 'none' }} />
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '2.5rem 1.5rem' : '3rem 2rem' }}>
          <Fade>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? '2rem 1.5rem' : '2rem' }}>
              <Stat val="Free" label="No cost, ever" accent />
              <Stat val="Walk-In" label="No appointment" />
              <Stat val="Multi-City" label="Expanding" />
              <Stat val="Community" label="Built for access" />
            </div>
          </Fade>
        </div>
      </div>

      {/* ── Services ── */}
      <Section label="Services" title="What we offer.">
        <p style={{ fontSize: 14, opacity: 0.52, lineHeight: 1.8, maxWidth: 480, marginBottom: 48 }}>
          Services vary by event and community need. Check individual event pages for what's available at each location.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 12 }}>
          {services.map((s, i) => (
            <Fade key={s.title} delay={i * 0.07}>
              <SCard {...s} />
            </Fade>
          ))}
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section label="How It Works" title="Walk in. Walk out healthier." alt>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 32 : 48, marginTop: 16 }}>
          {[
            { n: '1', h: 'Find an event.', b: 'Check our events page for upcoming locations and available services. Pre-register to help us prepare.' },
            { n: '2', h: 'Check in. Move through.', b: 'Register at the door, move through screening stations at your own pace, and get results before you leave.' },
            { n: '3', h: 'Get connected.', b: 'Anything flagged gets a referral to local care. You leave knowing your numbers and your next step.' },
          ].map((s, i) => (
            <Fade key={s.n} delay={i * 0.1}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, border: `1px solid rgba(227,194,155,0.28)`,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: S, flexShrink: 0
                }}>{s.n}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.h}</h3>
                  <p style={{ fontSize: 13, opacity: 0.48, lineHeight: 1.75 }}>{s.b}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </Section>

      {/* ── Mission ── */}
      <Section label="Mission" title={<>The system wasn't<br />built for everyone.</>}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
          <Fade>
            <p style={{ fontSize: 15, opacity: 0.55, lineHeight: 1.85, marginBottom: 16 }}>
              Millions go unscreened every year — not from lack of care, but lack of access. Syntra deploys directly into those communities, removing every barrier we can.
            </p>
            <p style={{ fontSize: 15, opacity: 0.55, lineHeight: 1.85 }}>
              Student-led. Volunteer-powered. Community-driven.
            </p>
          </Fade>
          <Fade delay={0.15}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 }}>
              {[
                { l: 'Who we serve', v: 'Uninsured and underinsured individuals, immigrant communities, low-income families, and anyone without routine access to care.' },
                { l: 'Who runs it', v: 'Student founders, trained volunteers, community health workers, and partner organizations.' },
                { l: 'Cost to you', v: 'Nothing. Every event is completely free.', accent: true },
              ].map((f, i, arr) => (
                <div key={f.l} style={{ padding: '20px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.3, marginBottom: 6 }}>{f.l}</div>
                  <p style={{ fontSize: 14, opacity: f.accent ? 1 : 0.68, lineHeight: 1.65, fontWeight: f.accent ? 700 : 400, color: f.accent ? S : B }}>{f.v}</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </Section>

      {/* ── Impact numbers ── */}
      <div style={{ background: 'rgba(227,194,155,0.04)', borderTop: '1px solid rgba(227,194,155,0.1)', borderBottom: '1px solid rgba(227,194,155,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '3.5rem 1.5rem' : '5rem 2rem' }}>
          <Fade>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: S, marginBottom: 12 }}>The Need</div>
              <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, letterSpacing: '-0.02em' }}>Why this matters.</h2>
            </div>
          </Fade>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 32, textAlign: 'center' }}>
            {[
              { n: '25M+', l: 'Uninsured Americans' },
              { n: '1 in 3', l: 'Adults have undetected hypertension' },
              { n: '96M', l: 'US adults with prediabetes' },
              { n: '50%', l: 'Of mental illness goes untreated' },
            ].map((s, i) => (
              <Fade key={s.n} delay={i * 0.08}>
                <div>
                  <div style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: S, marginBottom: 6 }}>{s.n}</div>
                  <div style={{ fontSize: 12, opacity: 0.45, lineHeight: 1.5 }}>{s.l}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <Section>
        <Fade>
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: isMobile ? '2.5rem 1.75rem' : '5rem',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', width: 400, height: 400, right: -80, bottom: -80, background: 'rgba(227,194,155,0.07)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
              <span style={{ display: 'inline-block', background: S, color: C, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 9999, marginBottom: 20 }}>Now Recruiting</span>
              <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>Get involved.</h2>
              <p style={{ fontSize: 15, opacity: 0.55, lineHeight: 1.8, marginBottom: 32 }}>
                We're building a team of volunteers, community partners, and organizations ready to bring free screenings to people who need them.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', maxWidth: isMobile ? 260 : 'none' }}>
                <a href="volunteer.html" style={{ background: S, color: C, fontWeight: 700, fontSize: 14, padding: '14px 28px', borderRadius: 12, textAlign: 'center', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.target.style.opacity = 0.85} onMouseLeave={e => e.target.style.opacity = 1}>
                  Join as Volunteer
                </a>
                <a href="partner.html" style={{ border: '1px solid rgba(255,255,255,0.15)', color: B, fontWeight: 600, fontSize: 14, padding: '14px 28px', borderRadius: 12, textAlign: 'center', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'} onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}>
                  Partner With Us
                </a>
              </div>
            </div>
          </div>
        </Fade>
      </Section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: S }}>Screen • Refer • Connect</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 11, opacity: 0.4 }}>
            <a href="https://www.linkedin.com/company/joinsyntra/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/joinsyntra/" target="_blank" rel="noreferrer">Instagram</a>
            <span>© 2026 Syntra.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────
function Section({ label, title, children, alt }) {
  const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const isMobile = W < 768;
  return (
    <div style={{ background: alt ? 'rgba(255,255,255,0.015)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '4rem 1.5rem' : '6rem 2rem' }}>
        {label && <Fade><div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: S, marginBottom: 12 }}>{label}</div></Fade>}
        {title && <Fade delay={0.05}><h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>{title}</h2></Fade>}
        {children}
      </div>
    </div>
  );
}
