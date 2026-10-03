export function CinderUpkeep({ cinders, upkeep }: { cinders: number; upkeep: number }) {
  const available = Math.max(0, Math.min(20, cinders));
  const reserved = Math.min(available, upkeep);
  const shortfall = Math.max(0, upkeep - available);
  const description = `${upkeep} Cinders due next upkeep; ${reserved} reserved${shortfall ? `; ${shortfall} health will cover the shortfall` : ""}.`;
  return <div className={`cinder-reserve ${shortfall ? "shortfall" : ""}`} role="img" aria-label={description} title={description}>
    <span className="cinder-available" style={{ width: `${(available - reserved) * 5}%` }} />
    <span className="cinder-reserved" style={{ left: `${(available - reserved) * 5}%`, width: `${reserved * 5}%` }} />
  </div>;
}
