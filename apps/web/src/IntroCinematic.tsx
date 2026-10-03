import { useEffect, useRef, useState } from "react";
import { assetUrl } from "./baseUrl";
import "./intro.css";
import { enterMobileFullscreen } from "./MobileShell";

/** Audio is muxed into the video: enabling sound never changes its visual timing. */
export function IntroCinematic({ onStart, volume, onVolume }: {
  onStart: () => void; volume: number; onVolume: (value: number) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);
  const [paused, setPaused] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [failed, setFailed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setPaused(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const el = video.current; if (!el) return;
    el.volume = volume;
    if (paused) el.pause(); else void el.play().catch(() => setPaused(true));
  }, [paused, volume]);
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(onStart, 450);
    return () => clearTimeout(timer);
  }, [leaving, onStart]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && (e.target === document.body || e.target === document.documentElement)) {
        e.preventDefault(); void enterMobileFullscreen(); setLeaving(true);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const enableSound = () => {
    const el = video.current; if (!el) return;
    const next = !sound;
    if (next && volume === 0) { onVolume(.35); el.volume = .35; }
    if (!next) onVolume(0);
    el.muted = !next; setSound(next);
    if (!paused) void el.play().catch(() => setPaused(true));
  };
  return <main className={`intro-cinematic ${leaving ? "intro-leaving" : ""}`} aria-label="Runelord cinematic title screen">
    <video ref={video} className="intro-film" autoPlay={!paused} loop muted={!sound} playsInline preload="auto" poster={assetUrl("/opening-assets/oath-intro-r7-poster.jpg")} onError={() => setFailed(true)} aria-hidden="true">
      <source src={assetUrl("/opening-assets/oath-intro-r7.mp4")} type="video/mp4" />
    </video>
    <div className="intro-title">
      <div className="intro-runes" aria-hidden="true">ᚱ ᚢ ᚾ ᛖ ◇ ᛟ ᚨ ᛏ ᚺ</div>
      <p className="intro-eyebrow">AN OATH FORGED IN FIRE</p>
      <h1 className="intro-stone-title"><img src={assetUrl("/opening-assets/runelord-runestone-title.webp")} alt="Runelord" /></h1>
      <p className="intro-subtitle">CINDER <i>&amp;</i> OATH</p>
      <div className="intro-divider" aria-hidden="true">◆</div>
      <p className="intro-vow">Bind the fallen. Command the inferno.</p>
      <button className="intro-start" disabled={leaving} onClick={() => { void enterMobileFullscreen(); setLeaving(true); }}>Press Start</button>
      <p className="intro-start-hint">CLICK · ENTER · SPACE</p>
    </div>
    <div className="intro-controls" aria-label="Cinematic controls">
      <button onClick={enableSound} aria-pressed={sound}>{sound ? "♫ Sound on" : "♫ Enable cinematic sound"}</button>
      <button onClick={() => setPaused(v => !v)} aria-pressed={paused}>{paused ? "Play cinematic" : "Pause cinematic"}</button>
      {sound && <input aria-label="Cinematic volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e => onVolume(Number(e.target.value))} />}
    </div>
    {failed && <p className="intro-fallback-note" role="status">The cinematic could not load. Press Start to continue.</p>}
  </main>;
}

