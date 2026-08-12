const PODIUM_ORDER = [1, 0, 2];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function Podium({ topThree }) {
  if (topThree.length === 0) return null;

  return (
    <div className="podium">
      {PODIUM_ORDER.map((rankIndex) => {
        const player = topThree[rankIndex];
        if (!player) return <div key={rankIndex} className="podium-spot podium-spot--empty" />;

        return (
          <div key={player.id} className={`podium-spot podium-spot--${rankIndex + 1}`}>
            <span className="podium-medal">{MEDALS[rankIndex]}</span>
            <span className="podium-name">{player.name}</span>
            <span className="podium-points">{player.points} pts</span>
            <div className="podium-block">{rankIndex + 1}</div>
          </div>
        );
      })}
    </div>
  );
}
