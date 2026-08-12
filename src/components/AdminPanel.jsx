import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPanel({ players, currentPlayerId, onDeleted }) {
  const [pendingId, setPendingId] = useState(null);

  async function handleDelete(playerId, name) {
    if (!window.confirm(`¿Eliminar a ${name} de la liga? Se borran también sus jugadas.`)) return;

    setPendingId(playerId);
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    setPendingId(null);
    if (!error) onDeleted(playerId);
  }

  return (
    <section className="app-section admin-panel">
      <h2 className="section-title">Administrar jugadores</h2>
      <ul className="admin-list">
        {players.map((player) => (
          <li key={player.id} className="admin-list-item">
            <span>
              {player.name}
              {player.is_admin && " 👑"}
            </span>
            {player.id !== currentPlayerId && (
              <button
                className="btn btn--ghost btn--danger"
                disabled={pendingId === player.id}
                onClick={() => handleDelete(player.id, player.name)}
              >
                {pendingId === player.id ? "..." : "Eliminar"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
