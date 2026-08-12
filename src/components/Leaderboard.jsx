export default function Leaderboard({ ranked }) {
  return (
    <table className="leaderboard">
      <thead>
        <tr>
          <th>#</th>
          <th>Jugador</th>
          <th>Puntos</th>
        </tr>
      </thead>
      <tbody>
        {ranked.map((player, index) => (
          <tr key={player.id} className={index < 3 ? `leaderboard-row leaderboard-row--top${index + 1}` : "leaderboard-row"}>
            <td className="leaderboard-rank">{index + 1}</td>
            <td className="leaderboard-name">{player.name}</td>
            <td className="leaderboard-points">{player.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
