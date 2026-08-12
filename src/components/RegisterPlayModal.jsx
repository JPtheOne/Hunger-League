import { useState } from "react";
import { ACTIONS } from "../data/seed";

export default function RegisterPlayModal({ player, onClose, onSubmit }) {
  const [actionId, setActionId] = useState(ACTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!actionId || submitting) return;
    setSubmitting(true);
    await onSubmit({ actionId });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2 className="modal-title">Registrar jugada</h2>
        <p className="modal-subtitle">
          Para: <strong>{player.name}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <span className="modal-label">Acción</span>
          <div className="modal-actions">
            {ACTIONS.map((action) => (
              <button
                type="button"
                key={action.id}
                className={`modal-action-btn ${actionId === action.id ? "modal-action-btn--selected" : ""}`}
                onClick={() => setActionId(action.id)}
              >
                <span className="modal-action-emoji">{action.emoji}</span>
                <span className="modal-action-label">{action.label}</span>
                <span className="modal-action-points">+{action.points}</span>
              </button>
            ))}
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
