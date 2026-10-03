export function MinionDetails({ name, hp, maxHp, guard, defender, power, scorch }: {
  name: string; hp: number; maxHp: number; guard: number; defender: boolean; power: number; scorch: number;
}) {
  const health = Math.max(0, Math.min(100, hp / Math.max(1, maxHp) * 100));
  return <div className="minion-details">
    <div className="minion-name"><span>{name}</span><span className="minion-power" title={`${power} attack damage`} aria-label={`${power} attack damage`}>⚔{power}</span>{scorch > 0 && <span className="minion-scorch" title={`Applies ${scorch} Scorch`} aria-label={`Applies ${scorch} Scorch`}>✦{scorch}</span>}{(defender || guard > 0) &&
      <span className="minion-guard" title={`${defender ? "Defender · " : ""}${guard} Guard`} aria-label={`${defender ? "Defender, " : ""}${guard} Guard`}>⬡{guard > 0 ? guard : ""}</span>}</div>
    <div className="hp-track minion-health" role="meter" aria-label={`${name} health`} aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={Math.max(0, hp)}>
      <i style={{ width: `${health}%` }} />
      <span className="minion-health-value">{Math.max(0, hp)} / {maxHp}</span>
    </div>
  </div>;
}
