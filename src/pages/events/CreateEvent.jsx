import { useNavigate, Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import EventForm from "../../components/events/EventForm";
import { createEvent } from "../../api/eventsApi";

export default function CreateEvent() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    const res = await createEvent(formData);
    const newEvent = res.data.data;
    navigate(`/events/${newEvent.id}`);
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto">
        <Link to="/events" className="text-sm text-bark-light/60 hover:text-bark mb-4 inline-flex items-center gap-1">
          ← Back to chapters
        </Link>
        <h1 className="font-serif text-3xl text-ink mb-1">New chapter</h1>
        <p className="text-bark-light/70 text-sm mb-8">
          Give this part of your life a home.
        </p>

        <EventForm onSubmit={handleSubmit} submitLabel="Create chapter" />
      </div>
    </AppShell>
  );
}
