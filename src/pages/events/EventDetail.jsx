import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import MemoryPath from "../../components/memories/MemoryPath";
import MemoryPeekPopover from "../../components/memories/MemoryPeekPopover";
import MemoryFormModal from "../../components/memories/MemoryFormModal";
import StoryMode from "../../components/memories/StoryMode";
import { getEventById, deleteEvent } from "../../api/eventsApi";
import { getAllMemoriesForEvent, createMemory } from "../../api/memoriesApi";
import { uploadMedia } from "../../api/mediaApi";
import { CATEGORY_STYLES } from "../../utils/constants";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [memories, setMemories] = useState([]);
  const [memoriesStatus, setMemoriesStatus] = useState("loading"); // loading | ready | error
  const [viewMode, setViewMode] = useState("trail"); // "trail" | "story"

  // Quick-peek popover: which memory + where the click happened (for anchoring)
  const [peek, setPeek] = useState(null); // { memory, anchorRect } | null
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadEvent = async () => {
      if (!cancelled) setStatus("loading");
      try {
        const res = await getEventById(id);
        if (!cancelled) {
          setEvent(res.data.data);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) setStatus(err.response?.status === 404 ? "notfound" : "error");
      }
    };

    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadMemories = useCallback(async () => {
    setMemoriesStatus("loading");
    try {
      const res = await getAllMemoriesForEvent(id);
      setMemories(res.data.data || []);
      setMemoriesStatus("ready");
    } catch {
      setMemoriesStatus("error");
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadMemories();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMemories]);

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await deleteEvent(id);
      navigate("/events");
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleNodeClick = (memory, anchorRect) => {
    setPeek({ memory, anchorRect });
  };

  const handleCreateMemory = async (payload, files = []) => {
    const res = await createMemory(id, payload);
    let media = [];

    if (files.length > 0) {
      try {
        const mediaRes = await uploadMedia(res.data.data.id, files);
        media = mediaRes.data.data;
      } catch {
        // Memory was created successfully even if photo upload failed —
        // the user can add photos later from the memory's full page.
      }
    }

    const newMemory = { ...res.data.data, media };
    setMemories((prev) => [...prev, newMemory]);
    setShowCreateModal(false);
  };

  if (status === "loading") {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="aspect-[16/7] bg-parchment-dark/40 rounded-2xl" />
          <div className="h-7 bg-parchment-dark/40 rounded w-2/3" />
          <div className="h-4 bg-parchment-dark/40 rounded w-1/3" />
        </div>
      </AppShell>
    );
  }

  if (status === "notfound") {
    return (
      <AppShell>
        <div className="card p-12 text-center max-w-md mx-auto">
          <h3 className="font-serif text-xl text-ink mb-2">Chapter not found</h3>
          <p className="text-bark-light/70 text-sm mb-6">
            This chapter doesn't exist or isn't yours to view.
          </p>
          <Link to="/events" className="btn-secondary inline-block">Back to chapters</Link>
        </div>
      </AppShell>
    );
  }

  if (status === "error") {
    return (
      <AppShell>
        <div className="card p-12 text-center max-w-md mx-auto">
          <p className="text-bark-light">Something went wrong loading this chapter.</p>
        </div>
      </AppShell>
    );
  }

  const style = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.Other;
  const started = formatDate(event.started_at);
  const ended = event.is_ongoing ? "Present" : formatDate(event.ended_at);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <Link to="/events" className="text-sm text-bark-light/60 hover:text-bark mb-4 inline-flex items-center gap-1">
          ← Back to chapters
        </Link>

        {/* Event header — cover image with title overlaid via gradient, so
            the chapter feels like a single editorial moment rather than an
            image stacked on top of a separate text block. */}
        <div className="card overflow-hidden mb-10 relative">
          <div className="aspect-[16/8] bg-parchment-dark relative">
            {event.cover_image_url ? (
              <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-parchment-dark to-mist/40">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-mist">
                  <path
                    d="M12 2C12 2 7 6 7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11C17 6 12 2 12 2Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Gradient so title text stays readable over any image */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />

            {event.is_private && (
              <div className="absolute top-4 right-4 bg-ink/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-parchment-light">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="text-xs text-parchment-light font-medium">Private</span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Link
                to={`/events/${event.id}/edit`}
                className="bg-white/90 hover:bg-white text-bark text-sm font-medium py-1.5 px-3 rounded-lg backdrop-blur-sm transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-white/90 hover:bg-white text-red-600 text-sm font-medium py-1.5 px-3 rounded-lg backdrop-blur-sm transition-colors"
              >
                Delete
              </button>
            </div>

            {/* Title block sits directly on the image */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${style.bg} ${style.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {event.category}
              </span>
              <h1 className="font-serif text-3xl text-parchment-light leading-snug mb-1 drop-shadow-sm">
                {event.title}
              </h1>
              {(started || ended) && (
                <p className="text-sm text-parchment-light/80">
                  {started}
                  {ended && ` — ${ended}`}
                  {event.is_ongoing && <span className="text-sage-light ml-2">● Ongoing</span>}
                </p>
              )}
            </div>
          </div>

          {event.description && (
            <div className="p-6 border-t border-parchment-dark/60">
              <p className="text-ink leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Memory trail section — breaks out wider than the header card so
          the trail has real room to wind side to side instead of looking
          squeezed into a narrow reading column. */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-serif text-2xl text-ink">
            {viewMode === "trail" ? "Your memory trail" : "Read the story"}
          </h2>

          <div className="flex items-center gap-2">
            {memories.length > 0 && (
              <div className="inline-flex bg-parchment border border-mist rounded-full p-1">
                <button
                  onClick={() => setViewMode("trail")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    viewMode === "trail" ? "bg-bark text-parchment-light" : "text-bark-light"
                  }`}
                >
                  Trail
                </button>
                <button
                  onClick={() => setViewMode("story")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    viewMode === "story" ? "bg-bark text-parchment-light" : "text-bark-light"
                  }`}
                >
                  Story
                </button>
              </div>
            )}
            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-2">
              + Add memory
            </button>
          </div>
        </div>

        {memoriesStatus === "loading" && (
          <div className="flex justify-center py-16">
            <p className="text-bark-light/60 text-sm">Walking the trail…</p>
          </div>
        )}

        {memoriesStatus === "error" && (
          <div className="card p-10 text-center max-w-2xl mx-auto">
            <p className="text-bark-light">Couldn't load memories for this chapter.</p>
          </div>
        )}

        {memoriesStatus === "ready" && memories.length === 0 && (
          <div className="card p-12 text-center max-w-2xl mx-auto">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-mist mx-auto mb-4">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h3 className="font-serif text-xl text-ink mb-2">No memories yet</h3>
            <p className="text-bark-light/70 text-sm mb-6 max-w-sm mx-auto">
              Start laying down the trail — add the first moment from this chapter.
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-block">
              + Add your first memory
            </button>
          </div>
        )}

        {memoriesStatus === "ready" && memories.length > 0 && viewMode === "trail" && (
          <div className="overflow-x-hidden pb-12">
            <MemoryPath memories={memories} onNodeClick={handleNodeClick} />
          </div>
        )}

        {memoriesStatus === "ready" && memories.length > 0 && viewMode === "story" && (
          <StoryMode eventId={id} memories={memories} />
        )}
      </div>

      {/* Quick-peek popover anchored near the clicked node */}
      {peek && (
        <MemoryPeekPopover
          memory={peek.memory}
          eventId={id}
          anchorRect={peek.anchorRect}
          onClose={() => setPeek(null)}
        />
      )}

      {/* Create memory modal */}
      {showCreateModal && (
        <MemoryFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMemory}
        />
      )}

      {/* Delete event confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-20 px-6">
          <div className="card bg-white p-6 max-w-sm w-full">
            <h3 className="font-serif text-lg text-ink mb-2">Delete this chapter?</h3>
            <p className="text-sm text-bark-light/70 mb-6">
              "{event.title}" and its memories will be removed. This can't be undone from here.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
