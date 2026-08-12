import { ACTIONS } from "../data/seed";
import { timeAgo } from "../utils/scores";

function findPlayerName(players, playerId) {
  return players.find((player) => player.id === playerId)?.name ?? "???";
}

function findAction(actionId) {
  return ACTIONS.find((action) => action.id === actionId);
}

export default function Feed({ players, plays }) {
  const recent = [...plays].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  return (
    <ul className="feed">
      {recent.length === 0 && <li className="feed-empty">Todavía no hay jugadas registradas.</li>}
      {recent.map((play) => {
        const action = findAction(play.actionId);
        return (
          <li key={play.id} className="feed-item">
            <span className="feed-emoji">{action?.emoji}</span>
            <span className="feed-text">
              <strong>{findPlayerName(players, play.playerId)}</strong> registró{" "}
              <strong>{action?.label}</strong>
              <span className="feed-points"> +{play.points}</span>
            </span>
            <span className="feed-time">{timeAgo(play.timestamp)}</span>
          </li>
        );
      })}
    </ul>
  );
}
