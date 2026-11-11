import { useEffect, useRef, useState } from 'react';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { Engagement } from '../components/Engagement';
import { Faq } from '../components/Faq';
import { FlightCanvas } from '../components/FlightCanvas';
import { Hero } from '../components/Hero';
import { Intro } from '../components/Intro';
import { MissionRail } from '../components/MissionRail';
import { Nav } from '../components/Nav';
import { Offer } from '../components/Offer';
import { Principles } from '../components/Principles';
import { ProofStrip } from '../components/ProofStrip';
import { Services } from '../components/Services';
import type { HeroEngine } from '../engines/hero.js';
import type { IntroEngine } from '../engines/intro.js';
import { mountMission, type MissionEngine } from '../engines/mission.js';
import type { FlightEngine } from '../engines/scrollflight.js';
import { usePrefs } from '../lib/PrefsContext';

export function Home() {
  const { t, lang } = usePrefs();

  // Canvas engines, owned by the components that render their canvas.
  const hero = useRef<HeroEngine | null>(null);
  const intro = useRef<IntroEngine | null>(null);
  const flight = useRef<FlightEngine | null>(null);
  const mission = useRef<MissionEngine | null>(null);

  const railFill = useRef<HTMLDivElement>(null);
  const [railReady, setRailReady] = useState(false);
  const [stage, setStage] = useState(-1);

  // Mission journey: smooth scrolling, soft section snapping and the progress
  // rail. GSAP and Lenis are loaded as a separate chunk; if that fails the page
  // simply keeps native scrolling.
  useEffect(() => {
    let cancelled = false;
    let engine: MissionEngine | null = null;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')])
      .then(([g, st, l]) => {
        if (cancelled) return;
        engine = mountMission({
          gsap: g.gsap,
          ScrollTrigger: st.ScrollTrigger,
          Lenis: l.default,
          fillEl: railFill.current,
          onStage: setStage,
          onReady: setRailReady,
        });
        mission.current = engine;
      })
      .catch(() => { /* enhancement only */ });
    return () => {
      cancelled = true;
      engine?.destroy();
      mission.current = null;
    };
  }, []);

  // Copy length differs per language, so section positions move: recompute the
  // flight route and the snap points after a language switch.
  useEffect(() => {
    flight.current?.refresh();
    mission.current?.refresh();
  }, [lang]);

  return (
    <>
      <Intro engineRef={intro} onHandoff={() => hero.current?.kick()} />
      <FlightCanvas engineRef={flight} />

      <a href="#main" className="skip-link">{t('a11y.skip')}</a>
      <Nav variant="home" onLogoTripleClick={() => hero.current?.burst()} />

      <main id="main">
        <div id="top" />
        <Hero engineRef={hero} onReplayIntro={() => intro.current?.play({ force: true })} />
        <ProofStrip />
        <Services />
        <Engagement />
        <Offer />
        <About />
        <Principles />
        <Faq />
        <Contact />
      </main>

      <MissionRail ready={railReady} stage={stage} fillRef={railFill} />
    </>
  );
}
