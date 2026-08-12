export function computeLeaderboard(players, plays) {
  const totals = new Map(players.map((player) => [player.id, 0]));

  for (const play of plays) {
    totals.set(play.playerId, (totals.get(play.playerId) ?? 0) + play.points);
  }

  return players
    .map((player) => ({ ...player, points: totals.get(player.id) ?? 0 }))
    .sort((a, b) => b.points - a.points);
}

export function timeAgo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;

  const diffDay = Math.round(diffHr / 24);
  return `hace ${diffDay} d`;
}
