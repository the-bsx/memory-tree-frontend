import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import EventForm from "../../components/events/EventForm";
import { getEventById, updateEvent } from "../../api/eventsApi";

// Backend returns snake_case + ISO dates; the form expects camelCase + YYYY-MM-DD
function toFormValues(event) {
  return {
    title: event.title || "",
    category: event.category || "",
    description: event.description || "",
    isPrivate: !!event.is_private,
    isOngoing: !!event.is_ongoing,
    startedAt: event.started_at ? event.started_at.slice(0, 10) : "",
    endedAt: event.ended_at ? event.ended_at.slice(0, 10) : "",
  };
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  useEffect(() => {
    getEventById(id)
      .then((res) => {
        setEvent(res.data.data);
        setStatus("ready");
      })
      .catch((err) => setStatus(err.response?.status === 404 ? "notfound" : "error"));
  }, [id]);

  const handleSubmit = async (formData) => {
    await updateEvent(id, formData);
    navigate(`/events/${id}`);
  };

  if (status === "loading") {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto animate-pulse space-y-4">
          <div className="h-7 bg-parchment-dark/40 rounded w-1/3" />
          <div className="aspect-[16/6] bg-parchment-dark/40 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (status === "notfound" || status === "error") {
    return (
      <AppShell>
        <div className="card p-12 text-center max-w-md mx-auto">
          <h3 className="font-serif text-xl text-ink mb-2">
            {status === "notfound" ? "Chapter not found" : "Something went wrong"}
          </h3>
          <Link to="/events" className="btn-secondary inline-block mt-4">Back to chapters</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto">
        <Link to={`/events/${id}`} className="text-sm text-bark-light/60 hover:text-bark mb-4 inline-flex items-center gap-1">
          ← Back to chapter
        </Link>
        <h1 className="font-serif text-3xl text-ink mb-1">Edit chapter</h1>
        <p className="text-bark-light/70 text-sm mb-8">Update the details of this chapter.</p>

        <EventForm
          initialValues={toFormValues(event)}
          initialCoverUrl={event.cover_image_url}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </AppShell>
  );
}
