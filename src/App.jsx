import { useEffect, useMemo, useState } from "react";
import { ACTIONS } from "./data/seed";
import { computeLeaderboard } from "./utils/scores";
import { supabase } from "./lib/supabaseClient";
import Podium from "./components/Podium";
import Leaderboard from "./components/Leaderboard";
import Feed from "./components/Feed";
import RegisterPlayModal from "./components/RegisterPlayModal";
import Login from "./components/Login";
import JoinLeague from "./components/JoinLeague";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

function mapPlay(row) {
  return {
    id: row.id,
    playerId: row.player_id,
    actionId: row.action_id,
    points: row.points,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [players, setPlayers] = useState([]);
  const [plays, setPlays] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    setDataLoading(true);

    Promise.all([
      supabase.from("players").select("*").order("created_at"),
      supabase.from("plays").select("*"),
    ]).then(([playersRes, playsRes]) => {
      if (cancelled) return;
      setPlayers(playersRes.data ?? []);
      setPlays((playsRes.data ?? []).map(mapPlay));
      setDataLoading(false);
    });

    const channel = supabase
      .channel("plays-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "plays" },
        (payload) => {
          setPlays((current) =>
            current.some((play) => play.id === payload.new.id)
              ? current
              : [...current, mapPlay(payload.new)]
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const ranked = useMemo(() => computeLeaderboard(players, plays), [players, plays]);
  const topThree = ranked.slice(0, 3);
  const myPlayer = players.find((player) => player.user_id === session?.user?.id);

  async function handleRegisterPlay({ actionId }) {
    const action = ACTIONS.find((entry) => entry.id === actionId);
    if (!action || !myPlayer) return;

    const { error } = await supabase
      .from("plays")
      .insert({ player_id: myPlayer.id, action_id: actionId, points: action.points });

    if (!error) setModalOpen(false);
  }

  function handlePlayerCreated(newPlayer) {
    setPlayers((current) => [...current, newPlayer]);
  }

  function handlePlayerDeleted(playerId) {
    setPlayers((current) => current.filter((player) => player.id !== playerId));
    setPlays((current) => current.filter((play) => play.playerId !== playerId));
  }

  if (session === undefined) return null;
  if (!session) return <Login />;
  if (dataLoading) return null;
  if (!myPlayer) {
    return <JoinLeague userId={session.user.id} onCreated={handlePlayerCreated} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">HUNGER LEAGUE</h1>
        <div className="app-header-actions">
          <span className="app-user">Hola, {myPlayer.name}</span>
          <button className="btn btn--primary" onClick={() => setModalOpen(true)}>
            Registrar jugada
          </button>
          <button className="btn btn--ghost" onClick={() => supabase.auth.signOut()}>
            Salir
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="app-section">
          <Podium topThree={topThree} />
          <Leaderboard ranked={ranked} />
        </section>

        <section className="app-section app-section--feed">
          <h2 className="section-title">Últimas jugadas</h2>
          <Feed players={players} plays={plays} />
        </section>
      </main>

      {myPlayer.is_admin && (
        <AdminPanel players={players} currentPlayerId={myPlayer.id} onDeleted={handlePlayerDeleted} />
      )}

      {isModalOpen && (
        <RegisterPlayModal
          player={myPlayer}
          onClose={() => setModalOpen(false)}
          onSubmit={handleRegisterPlay}
        />
      )}
    </div>
  );
}
