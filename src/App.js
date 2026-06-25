import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const S = '#E3C29B', B = '#F5F2EB', C = '#0a0a0a', DIM = 'rgba(245,242,235,0.55)';

function useW() {
  const [w, setW] = useState(800);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

function Nav() {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const h = () => setSc(window.scrollY > 60);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:300,padding:'1.25rem 0',
      background:sc?'rgba(10,10,10,0.92)':'transparent',
      backdropFilter:sc?'blur(20px)':'none',
      borderBottom:sc?'1px solid rgba(255,255,255,0.06)':'none',
      transition:'all 0.4s'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <img src="https://github.com/Lightshayan/joinsyntra/blob/main/Syntra.png?raw=true" alt="Syntra" style={{height:22,width:'auto',objectFit:'contain'}} />
        <div style={{display:'flex',gap:32,fontSize:13,fontWeight:500}}>
          {['Events','Volunteer','Partner','Resources'].map(l => (
            <a key={l} href={`${l.toLowerCase()}.html`} style={{color:B,opacity:0.6,textDecoration:'none',transition:'opacity 0.2s'}}
              onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.6}>{l}</a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Marquee row
function Marquee({ items, reverse }) {
  const doubled = [...items, ...items];
  return (
    <div style={{overflow:'hidden',width:'100%',maskImage:'linear-gradient(to right,transparent,black 10%,black 90%,transparent)'}}>
      <motion.div
        animate={{x: reverse ? ['0%','-50%'] : ['-50%','0%']}}
        transition={{duration:55,repeat:Infinity,ease:'linear'}}
        style={{display:'flex',gap:12,width:'max-content'}}>
        {doubled.map((item,i) => (
          <div key={i} style={{
            whiteSpace:'nowrap',padding:'10px 22px',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:9999,fontSize:13,fontWeight:500,
            color:item.accent?S:B,
            background:item.accent?'rgba(227,194,155,0.07)':'rgba(255,255,255,0.03)',
            letterSpacing:'0.02em',flexShrink:0
          }}>{item.label}</div>
        ))}
      </motion.div>
    </div>
  );
}

const Fade = ({children,delay=0,y=24}) => (
  <motion.div initial={{opacity:0,y}} whileInView={{opacity:1,y:0}}
    viewport={{once:true,margin:'-50px'}}
    transition={{duration:0.7,delay,ease:[0.22,1,0.36,1]}}>
    {children}
  </motion.div>
);

function BgCanvas() {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf, W, H;
    const pts = [];
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) pts.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,o:Math.random()*.35+.08,r:Math.random()*1.1+.2});
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const g = ctx.createRadialGradient(W*.7,H*.2,0,W*.7,H*.2,W*.6);
      g.addColorStop(0,'rgba(227,194,155,0.06)'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(227,194,155,${p.o})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(227,194,155,${.06*(1-d/100)})`;ctx.lineWidth=.5;ctx.stroke();}
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={ref} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none',opacity:.65}}/>;
}

export default function App() {
  const w = useW();
  const mob = w < 768;
  const { scrollYProgress } = useScroll();
  const heroOp = useTransform(scrollYProgress,[0,.15],[1,0]);
  const heroY2 = useTransform(scrollYProgress,[0,.15],[0,-40]);

  const row1 = [
    {label:'Blood Pressure'},{label:'Blood Glucose',accent:true},{label:'BMI Screening'},
    {label:'Heart Rate'},{label:'Vision Screening',accent:true},{label:'Mental Health Check-In'},
    {label:'Resource Navigation',accent:true},{label:'Health Education'},{label:'Cholesterol'},
    {label:'Oxygen Saturation'},{label:'Diabetes Risk',accent:true},{label:'Insurance Enrollment'},
  ];
  const row2 = [
    {label:"Women's Health",accent:true},{label:'Dental Screening'},{label:'Pediatric Care',accent:true},
    {label:'Nutrition Guidance'},{label:'Pharmacy Programs',accent:true},{label:'Free Clinic Referrals'},
    {label:'Food Access'},{label:'Hypertension Screening',accent:true},{label:'Respiratory Health'},
    {label:'Social Services'},{label:'Follow-Up Care',accent:true},{label:'Community Outreach'},
  ];

  const btn = (href,label,primary) => (
    <a href={href} style={{
      background:primary?S:'transparent',color:primary?C:B,fontWeight:700,fontSize:14,
      padding:'13px 28px',borderRadius:10,textAlign:'center',display:'inline-block',
      border:primary?'none':'1px solid rgba(255,255,255,0.15)',transition:'all 0.2s',
    }}
      onMouseEnter={e=>{e.currentTarget.style.opacity='.82';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='none'}}>{label}</a>
  );

  return (
    <div style={{background:C,color:B,fontFamily:'system-ui,-apple-system,sans-serif',overflowX:'hidden'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        ::selection{background:${S};color:${C}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(227,194,155,.3);border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes sa{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
      `}</style>

      <BgCanvas/>
      <Nav/>

      {/* ── Hero ── */}
      <motion.section style={{position:'relative',zIndex:10,minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',padding:mob?'6rem 1.5rem 4rem':'0 2rem',opacity:heroOp,y:heroY2}}>
        <div style={{maxWidth:1100,margin:'0 auto',width:'100%'}}>
          <motion.div initial={{opacity:0,y:36}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.3,ease:[.22,1,.36,1]}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(227,194,155,.28)',color:S,fontSize:11,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',padding:'6px 16px',borderRadius:9999,marginBottom:32}}>
              <span style={{width:6,height:6,background:S,borderRadius:'50%',animation:'pulse 2s infinite',flexShrink:0}}/>
              Always Free
            </div>
            <h1 style={{fontSize:mob?42:80,fontWeight:900,lineHeight:1.02,letterSpacing:'-.035em',marginBottom:28,maxWidth:700}}>
              Free healthcare.<br/>
              <span style={{background:`linear-gradient(135deg,${B} 20%,${S})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                Wherever it's needed.
              </span>
            </h1>
            <p style={{fontSize:mob?16:19,color:DIM,maxWidth:480,lineHeight:1.78,marginBottom:40}}>
              Syntra runs free pop-up health screenings in underserved communities. No insurance required. No appointments needed. Walk in.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',flexDirection:mob?'column':'row',maxWidth:mob?240:'none'}}>
              {btn('events.html','See Upcoming Events',true)}
              {btn('volunteer.html','Get Involved',false)}
            </div>
          </motion.div>
        </div>
        {!mob && <div style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,opacity:.2,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase'}}>
          <div style={{width:1,height:36,background:`linear-gradient(to bottom,${B},transparent)`,animation:'sa 1.6s infinite'}}/>Scroll
        </div>}
      </motion.section>

      {/* ── Marquee ── */}
      <section style={{position:'relative',zIndex:10,padding:'4rem 0',borderTop:'1px solid rgba(255,255,255,.05)',borderBottom:'1px solid rgba(255,255,255,.05)',background:'rgba(255,255,255,.012)',overflow:'hidden'}}>
        <Fade>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:10}}>What We Screen For</div>
            <h2 style={{fontSize:mob?24:34,fontWeight:800,letterSpacing:'-.02em'}}>Services vary by event.</h2>
            <p style={{fontSize:14,color:DIM,marginTop:10}}>Every pop-up is tailored to the needs of the community it serves.</p>
          </div>
        </Fade>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Marquee items={row1} />
          <Marquee items={row2} reverse />
        </div>
      </section>

      {/* ── What If ── */}
      <section style={{position:'relative',zIndex:10,borderTop:'1px solid rgba(255,255,255,.05)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Fade>
            <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:12}}>The Mission</div>
            <h2 style={{fontSize:mob?28:48,fontWeight:900,letterSpacing:'-.03em',lineHeight:1.1,marginBottom:56,maxWidth:600}}>
              What if care was<br/>actually accessible?
            </h2>
          </Fade>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(5,1fr)',gap:mob?20:12}}>
            {[
              {n:'01',h:'Free',b:'No cost at every event. No exceptions.'},
              {n:'02',h:'Close',b:'Deployed where the need is highest, not where it\'s easiest.'},
              {n:'03',h:'Simple',b:'Walk in, get screened, and leave with answers.'},
              {n:'04',h:'Referred',b:'Every flag connects you to real follow-up care.'},
              {n:'05',h:'Yours',b:'Results in hand. No portal. No waiting.'},
            ].map((item,i) => (
              <Fade key={item.n} delay={i*.07}>
                <div style={{padding:'1.75rem 1.25rem',borderTop:`2px solid ${i===0?S:'rgba(255,255,255,0.08)'}`,paddingTop:'1.5rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:10,color:S,fontWeight:700,letterSpacing:'.15em',marginBottom:12}}>{item.n}</div>
                  <h3 style={{fontSize:mob?20:24,fontWeight:800,marginBottom:8}}>{item.h}</h3>
                  <p style={{fontSize:13,color:DIM,lineHeight:1.7}}>{item.b}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{position:'relative',zIndex:10,background:'rgba(255,255,255,.012)',borderTop:'1px solid rgba(255,255,255,.05)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Fade>
            <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:12}}>How It Works</div>
            <h2 style={{fontSize:mob?26:40,fontWeight:800,letterSpacing:'-.02em',marginBottom:52}}>Walk in. Walk out healthier.</h2>
          </Fade>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:mob?32:2}}>
            {[
              {n:'1',h:'Find an event.',b:'Check the events page for upcoming locations, available services, and how to pre-register.'},
              {n:'2',h:'Check in. Move through.',b:'Register at the door, move through screening stations at your own pace, and leave with your results.'},
              {n:'3',h:'Get connected.',b:'Anything flagged connects you to local care. You leave knowing your numbers and your next step.'},
            ].map((s,i) => (
              <Fade key={s.n} delay={i*.1}>
                <div style={{padding:mob?'0':'2rem 2.5rem',borderLeft:mob?'none':`1px solid rgba(255,255,255,${i===0?.16:.05})`,paddingLeft:mob?0:'2.5rem'}}>
                  <div style={{fontSize:mob?40:60,fontWeight:900,color:'rgba(227,194,155,0.15)',lineHeight:1,marginBottom:16}}>{s.n}</div>
                  <h3 style={{fontSize:18,fontWeight:700,marginBottom:10}}>{s.h}</h3>
                  <p style={{fontSize:14,color:DIM,lineHeight:1.75}}>{s.b}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Need stats ── */}
      <section style={{position:'relative',zIndex:10,background:'rgba(227,194,155,.04)',borderTop:'1px solid rgba(227,194,155,.12)',borderBottom:'1px solid rgba(227,194,155,.12)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Fade>
            <div style={{marginBottom:52,maxWidth:500}}>
              <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:12}}>The Gap</div>
              <h2 style={{fontSize:mob?26:40,fontWeight:800,letterSpacing:'-.02em',lineHeight:1.2}}>The need is real. The access is not.</h2>
            </div>
          </Fade>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr 1fr':'repeat(4,1fr)',gap:mob?'2.5rem 1.5rem':40}}>
            {[{n:'25M+',l:'Uninsured Americans'},{n:'1 in 3',l:'Adults with undetected hypertension'},{n:'96M',l:'US adults with prediabetes'},{n:'50%',l:'Of mental illness goes untreated'}].map((s,i)=>(
              <Fade key={s.n} delay={i*.08}>
                <div>
                  <div style={{fontSize:mob?32:48,fontWeight:900,color:S,letterSpacing:'-.03em',marginBottom:8}}>{s.n}</div>
                  <div style={{fontSize:13,color:DIM,lineHeight:1.55}}>{s.l}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{position:'relative',zIndex:10,borderTop:'1px solid rgba(255,255,255,.05)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:mob?36:80,alignItems:'start'}}>
          <Fade>
            <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:16}}>About Syntra</div>
            <h2 style={{fontSize:mob?26:40,fontWeight:800,letterSpacing:'-.02em',lineHeight:1.2,marginBottom:24}}>Built by students.<br/>For communities.</h2>
            <p style={{fontSize:15,color:DIM,lineHeight:1.85,marginBottom:16}}>
              Millions go unscreened every year. Not from lack of care, but lack of access. Syntra deploys directly into those communities and removes every barrier it can.
            </p>
            <p style={{fontSize:15,color:DIM,lineHeight:1.85}}>Student-led. Volunteer-powered. Community-driven.</p>
          </Fade>
          <Fade delay={.1}>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {[
                {l:'Who we serve',v:'Uninsured and underinsured individuals, immigrant communities, low-income families, and anyone without routine access to care.'},
                {l:'Who runs it',v:'Student founders, trained volunteers, community health workers, and partner organizations.'},
                {l:'Cost to you',v:'Nothing. Every event is completely free.',accent:true},
              ].map((f,i,arr)=>(
                <div key={f.l} style={{padding:'1.5rem 0',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,.06)':'none'}}>
                  <div style={{fontFamily:'monospace',fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',opacity:.3,marginBottom:8}}>{f.l}</div>
                  <p style={{fontSize:15,color:f.accent?S:DIM,fontWeight:f.accent?700:400,lineHeight:1.65}}>{f.v}</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ── Specialty ── */}
      <section style={{position:'relative',zIndex:10,background:'rgba(227,194,155,.03)',borderTop:'1px solid rgba(227,194,155,.1)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Fade>
            <div style={{display:'flex',alignItems:mob?'flex-start':'center',justifyContent:'space-between',flexDirection:mob?'column':'row',gap:20,marginBottom:48}}>
              <div>
                <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:12}}>Specialty Events</div>
                <h2 style={{fontSize:mob?24:36,fontWeight:800,letterSpacing:'-.02em'}}>Beyond the basics.</h2>
              </div>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',background:'rgba(227,194,155,.12)',color:S,padding:'8px 18px',borderRadius:9999,whiteSpace:'nowrap'}}>Select Events Only</span>
            </div>
          </Fade>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:12}}>
            {[
              {h:"Women's Health",b:'Screenings tailored to women-specific health needs, including reproductive and hormonal health checks.'},
              {h:'Dental Screening',b:'Basic oral health assessments with referrals to low-cost dental clinics.'},
              {h:'Pediatric Care',b:'Child-specific screenings and developmental health resources for families.'},
            ].map((s,i)=>(
              <Fade key={s.h} delay={i*.08}>
                <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(227,194,155,.15)',borderRadius:16,padding:28,transition:'border-color 0.25s,transform 0.25s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(227,194,155,.35)';e.currentTarget.style.transform='translateY(-3px)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(227,194,155,.15)';e.currentTarget.style.transform='none'}}>
                  <h3 style={{fontSize:17,fontWeight:700,color:S,marginBottom:10}}>{s.h}</h3>
                  <p style={{fontSize:13,color:DIM,lineHeight:1.75}}>{s.b}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner ── */}
      <section style={{position:'relative',zIndex:10,background:'rgba(255,255,255,.012)',borderTop:'1px solid rgba(255,255,255,.05)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Fade>
            <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:S,marginBottom:12}}>Partner With Us</div>
            <h2 style={{fontSize:mob?26:40,fontWeight:800,letterSpacing:'-.02em',marginBottom:16}}>Bring Syntra to your community.</h2>
            <p style={{fontSize:15,color:DIM,lineHeight:1.8,maxWidth:520,marginBottom:48}}>We work with community centers, faith organizations, clinics, and institutions to bring free health screenings directly to the people they serve.</p>
          </Fade>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:12,marginBottom:40}}>
            {[
              {h:'Venues',b:'Have a space? We handle everything else. Setup, volunteers, supplies, and breakdown are all on us.'},
              {h:'Healthcare Partners',b:'Clinics and providers can co-host events, offer follow-up care, or supply medical oversight for our screenings.'},
              {h:'Institutional Partners',b:'Schools, nonprofits, and government agencies can collaborate to identify high-need areas and co-deploy events.'},
            ].map((s,i)=>(
              <Fade key={s.h} delay={i*.08}>
                <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:28,transition:'all 0.25s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.18)';e.currentTarget.style.transform='translateY(-3px)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.07)';e.currentTarget.style.transform='none'}}>
                  <h3 style={{fontSize:16,fontWeight:700,marginBottom:10}}>{s.h}</h3>
                  <p style={{fontSize:13,color:DIM,lineHeight:1.75}}>{s.b}</p>
                </div>
              </Fade>
            ))}
          </div>
          <Fade delay={.15}>
            <a href="partner.html" style={{display:'inline-block',background:S,color:C,fontWeight:700,fontSize:14,padding:'13px 28px',borderRadius:10,transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.opacity='.82';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='none'}}>
              Become a Partner
            </a>
          </Fade>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{position:'relative',zIndex:10,borderTop:'1px solid rgba(255,255,255,.05)',padding:mob?'4rem 1.5rem':'6rem 2rem'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Fade>
            <div style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:mob?'2.5rem 1.75rem':'5rem',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',width:500,height:500,right:-100,bottom:-120,background:'rgba(227,194,155,.06)',borderRadius:'50%',filter:'blur(100px)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',width:300,height:300,left:-60,top:-80,background:'rgba(227,194,155,.04)',borderRadius:'50%',filter:'blur(80px)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1,maxWidth:540}}>
                <span style={{display:'inline-block',background:S,color:C,fontSize:9,fontWeight:800,letterSpacing:'.2em',textTransform:'uppercase',padding:'4px 14px',borderRadius:9999,marginBottom:24}}>Now Recruiting</span>
                <h2 style={{fontSize:mob?30:52,fontWeight:900,letterSpacing:'-.03em',lineHeight:1.08,marginBottom:20}}>
                  Get involved.<br/>
                  <span style={{background:`linear-gradient(135deg,${B},${S})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Make an impact.</span>
                </h2>
                <p style={{fontSize:15,color:DIM,lineHeight:1.8,marginBottom:32,maxWidth:420}}>
                  We're building a team of volunteers, community partners, and organizations ready to bring free screenings to people who need them.
                </p>
                <div style={{display:'flex',gap:12,flexDirection:mob?'column':'row',maxWidth:mob?240:'none'}}>
                  {btn('volunteer.html','Join as Volunteer',true)}
                  {btn('partner.html','Partner With Us',false)}
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <footer style={{position:'relative',zIndex:10,borderTop:'1px solid rgba(255,255,255,.05)',padding:'2.25rem 0'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <img src="https://github.com/Lightshayan/joinsyntra/blob/main/Syntra.png?raw=true" alt="Syntra" style={{height:18,width:'auto',objectFit:'contain'}} />
          <div style={{display:'flex',gap:24,fontSize:11,opacity:.4}}>
            <a href="https://www.linkedin.com/company/joinsyntra/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/joinsyntra/" target="_blank" rel="noreferrer">Instagram</a>
            <span>© 2026 Syntra.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
