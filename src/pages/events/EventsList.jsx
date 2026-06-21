import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import EventCard from "../../components/events/EventCard";
import { getAllEvents } from "../../api/eventsApi";
import { EVENT_CATEGORIES, CATEGORY_STYLES } from "../../utils/constants";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getAllEvents()
      .then((res) => {
        setEvents(res.data.data || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All") return events;
    return events.filter((e) => e.category === activeCategory);
  }, [events, activeCategory]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink mb-1">Your chapters</h1>
          <p className="text-bark-light/70 text-sm">
            The life events that hold your memories together.
          </p>
        </div>
        <Link to="/events/new" className="btn-primary">
          + New chapter
        </Link>
      </div>

      {/* Category filters */}
      {status === "ready" && events.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === "All"
                ? "bg-bark text-parchment-light border-bark"
                : "bg-white text-bark-light border-mist hover:border-bark"
            }`}
          >
            All
          </button>
          {EVENT_CATEGORIES.map((cat) => {
            const style = CATEGORY_STYLES[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-bark text-parchment-light border-bark"
                    : `${style.bg} ${style.text} border-transparent hover:opacity-80`
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-parchment-light" : style.dot}`} />
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {status === "loading" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card aspect-[16/9] animate-pulse bg-parchment-dark/40" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="card p-10 text-center">
          <p className="text-bark-light">Couldn't load your chapters. Try refreshing.</p>
        </div>
      )}

      {status === "ready" && events.length === 0 && (
        <div className="card p-12 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-mist mx-auto mb-4">
            <path
              d="M12 2C12 2 7 6 7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11C17 6 12 2 12 2Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
            />
            <path d="M12 17V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h3 className="font-serif text-xl text-ink mb-2">No chapters yet</h3>
          <p className="text-bark-light/70 text-sm mb-6 max-w-sm mx-auto">
            Start your tree with the first chapter of your life — a relationship, a trip, a career move.
          </p>
          <Link to="/events/new" className="btn-primary inline-block">
            + Create your first chapter
          </Link>
        </div>
      )}

      {status === "ready" && events.length > 0 && filteredEvents.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-bark-light">No chapters in this category yet.</p>
        </div>
      )}

      {status === "ready" && filteredEvents.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
