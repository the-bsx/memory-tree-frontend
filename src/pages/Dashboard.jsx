import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppShell from "../components/layout/AppShell";
import EventCard from "../components/events/EventCard";
import { useAuth } from "../context/AuthContext";
import { getAllEvents } from "../api/eventsApi";

export default function Dashboard() {
  const { user } = useAuth();
  const [recentEvents, setRecentEvents] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getAllEvents()
      .then((res) => {
        setRecentEvents((res.data.data || []).slice(0, 3));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <AppShell>
      <h1 className="font-serif text-3xl text-ink mb-1">
        Welcome, {user?.name?.split(" ")[0] || "there"}.
      </h1>
      <p className="text-bark-light/70 mb-8">
        Here's where your story has been growing.
      </p>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-ink">Recent chapters</h2>
        <Link to="/events" className="text-sm text-clay-dark hover:underline">
          View all →
        </Link>
      </div>

      {status === "loading" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card aspect-[16/9] animate-pulse bg-parchment-dark/40" />
          ))}
        </div>
      )}

      {status === "ready" && recentEvents.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-bark-light/70 mb-4">You haven't created any chapters yet.</p>
          <Link to="/events/new" className="btn-primary inline-block">
            + Create your first chapter
          </Link>
        </div>
      )}

      {status === "ready" && recentEvents.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
