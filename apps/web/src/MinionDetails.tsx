export function MinionDetails({ name, hp, maxHp, guard, defender, power, scorch, rot, promotionRank, armor, order }: {
  name: string; hp: number; maxHp: number; guard: number; defender: boolean; power: number; scorch: number; rot?: number; promotionRank?: number; armor?: number; order?: string;
}) {
  const health = Math.max(0, Math.min(100, hp / Math.max(1, maxHp) * 100));
  return <div className="minion-details">
    <div className="minion-name"><span>{name}</span><span className="minion-power" title={power ? `${power} attack damage` : "Support action"} aria-label={power ? `${power} attack damage` : "Support action"}>{power ? `⚔${power}` : "✧"}</span>{scorch > 0 && <span className="minion-scorch" title={`Applies ${scorch} Scorch`} aria-label={`Applies ${scorch} Scorch`}>✦{scorch}</span>}{rot !== undefined && <span className="minion-scorch" title="Rot damages this ally after every action">Rot {rot}</span>}{(defender || guard > 0) &&
      <span className="minion-guard" title={`${defender ? "Defender · " : ""}${guard} Guard`} aria-label={`${defender ? "Defender, " : ""}${guard} Guard`}>⬡{guard > 0 ? guard : ""}</span>}</div>
    {promotionRank !== undefined && <div className="legion-rank" title="Each promotion permanently adds 2 Power, 2 maximum HP and 1 Armor. Armor reduces each incoming hit."><span>Rank {promotionRank}</span><span>{armor ?? 0} Armor</span></div>}
    {order&&<span className="minion-order" title={`Repeating order: ${order}`}>{order}</span>}
    <div className="hp-track minion-health" role="meter" aria-label={`${name} health`} aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={Math.max(0, hp)}>
      <i style={{ width: `${health}%` }} />
      <span className="minion-health-value">{Math.max(0, hp)} / {maxHp}</span>
    </div>
  </div>;
}
