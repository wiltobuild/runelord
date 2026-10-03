import { useEffect, useState, type ReactNode } from "react";

export const mobileQuery = "(pointer: coarse) and (hover: none) and (max-width: 1366px)";
export function isMobileGame() { return matchMedia(mobileQuery).matches || (import.meta.env.DEV && new URLSearchParams(location.search).has("mobile-preview")); }

// Fullscreen must be requested synchronously from a user gesture. Unsupported
// browsers retain the same game with a landscape gate and safe-area layout.
export async function enterMobileFullscreen() {
  if (!isMobileGame()) return;
  try {
    if (!document.fullscreenElement && document.fullscreenEnabled)
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    const orientation = screen.orientation as ScreenOrientation & { lock?: (value: string) => Promise<void> };
    await orientation?.lock?.("landscape");
  } catch { /* The rotate prompt remains available if the browser refuses. */ }
}

export function MobileShell({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState(isMobileGame);
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const query = matchMedia(mobileQuery);
    const update = () => { const enabled = isMobileGame(); setMobile(enabled); document.documentElement.classList.toggle("mobile-game", enabled); };
    const changed = () => setFullscreen(!!document.fullscreenElement);
    update(); query.addEventListener("change", update);
    document.addEventListener("fullscreenchange", changed);
    return () => { query.removeEventListener("change", update); document.removeEventListener("fullscreenchange", changed); document.documentElement.classList.remove("mobile-game"); };
  }, []);
  return <>{children}{mobile && <>
    <div className="rotate-game" role="dialog" aria-modal="true" aria-label="Rotate to landscape">
      <span aria-hidden="true">↻</span><h1>Turn toward the inferno</h1>
      <p>Rotate your device to landscape to play Runelord.</p>
      <button onClick={() => void enterMobileFullscreen()}>Enter fullscreen</button>
    </div>
    {!fullscreen && document.fullscreenEnabled && <button className="mobile-fullscreen" aria-label="Enter fullscreen" onClick={() => void enterMobileFullscreen()}>⛶</button>}
  </>}</>;
}
