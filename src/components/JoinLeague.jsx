import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function JoinLeague({ userId, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("players")
      .insert({ user_id: userId, name: name.trim() })
      .select()
      .single();

    if (insertError || !data) {
      setError("No se pudo crear tu perfil, intenta de nuevo.");
      setSubmitting(false);
      return;
    }
    onCreated(data);
  }

  return (
    <div className="login-screen">
      <h1 className="app-title">HUNGER LEAGUE</h1>
      <p className="login-message">Elige cómo te van a ver en la tabla de posiciones.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="modal-select"
          placeholder="Tu nombre o apodo"
          value={name}
          maxLength={30}
          required
          onChange={(event) => setName(event.target.value)}
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Creando..." : "Unirme a la liga"}
        </button>
      </form>
    </div>
  );
}
