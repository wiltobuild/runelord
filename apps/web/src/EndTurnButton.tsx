import type { CSSProperties } from "react";

export function EndTurnButton({ busy, ending, disabled, turn, onClick }: {
  busy: boolean; ending: boolean; disabled: boolean; turn: number; onClick: () => void;
}) {
  return <>
    <button className={`primary end-turn-button ${ending ? "is-resolving" : ""}`}
      disabled={disabled} onClick={onClick} aria-busy={busy || ending}
      aria-label={ending ? "Resolving turn" : busy ? "Casting" : "End turn"}>
      <span className="end-turn-label">{ending ? "RESOLVING" : busy ? "CASTING" : "END TURN"}</span>
    </button>
    <div className={`turn-embers ${ending ? "released" : ""}`} aria-hidden="true">
      {Array.from({length: 12}, (_, i) => <i key={i} style={{"--i": i, "--angle": `${i * 30}deg`} as CSSProperties} />)}
    </div>
    {turn > 1 && <div key={turn} className="turn-announcement" aria-hidden="true"><span>TURN {turn}</span><strong>Your turn</strong></div>}
  </>;
}
