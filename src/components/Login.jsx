import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signInError) {
      setError(signInError.message);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="login-screen">
      <h1 className="app-title">HUNGER LEAGUE</h1>

      {status === "sent" ? (
        <p className="login-message">
          Te enviamos un link a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para entrar.
        </p>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="login-email">
            Tu email
          </label>
          <input
            id="login-email"
            type="email"
            required
            className="modal-select"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
            {status === "sending" ? "Enviando..." : "Enviarme el link"}
          </button>
        </form>
      )}
    </div>
  );
}
