import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import MemoryFormModal from "../../components/memories/MemoryFormModal";
import ImageLightbox from "../../components/memories/ImageLightbox";
import { getEventById } from "../../api/eventsApi";
import {
  getMemoryById,
  updateMemory,
  deleteMemory,
  getAllMemoriesForEvent,
} from "../../api/memoriesApi";
import { uploadMedia, updateMediaCaption, deleteMedia } from "../../api/mediaApi";
import { MOOD_STYLES } from "../../utils/constants";

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function MemoryDetailPage() {
  const { eventId, memoryId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [memory, setMemory] = useState(null);
  const [siblingIds, setSiblingIds] = useState([]); // ordered list of memory ids in this event, for prev/next
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed

  const [uploading, setUploading] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState(null);
  const [captionDraft, setCaptionDraft] = useState("");

  const loadData = useCallback(async () => {
    setStatus("loading");
    try {
      const [memoryRes, eventRes, allMemoriesRes] = await Promise.all([
        getMemoryById(memoryId),
        getEventById(eventId),
        getAllMemoriesForEvent(eventId),
      ]);
      setMemory(memoryRes.data.data);
      setEvent(eventRes.data.data);

      const ordered = (allMemoriesRes.data.data || [])
        .slice()
        .sort((a, b) => new Date(a.memory_date || 0) - new Date(b.memory_date || 0))
        .map((m) => m.id);
      setSiblingIds(ordered);
      setStatus("ready");
    } catch (err) {
      setStatus(err.response?.status === 404 ? "notfound" : "error");
    }
  }, [memoryId, eventId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadData();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const currentIndex = siblingIds.indexOf(memoryId);
  const prevId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < siblingIds.length - 1 ? siblingIds[currentIndex + 1] : null;

  const handleUpdate = async (payload) => {
    const res = await updateMemory(memoryId, payload);
    setMemory((prev) => ({ ...prev, ...res.data.data }));
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMemory(memoryId);
      navigate(`/events/${eventId}`);
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadMedia(memoryId, files);
      setMemory((prev) => ({ ...prev, media: [...(prev.media || []), ...res.data.data] }));
    } catch {
      // non-fatal — user can retry
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveCaption = async (mediaId) => {
    try {
      await updateMediaCaption(mediaId, captionDraft);
      setMemory((prev) => ({
        ...prev,
        media: prev.media.map((m) => (m.id === mediaId ? { ...m, caption: captionDraft } : m)),
      }));
    } finally {
      setEditingCaptionId(null);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await deleteMedia(mediaId);
      setMemory((prev) => ({ ...prev, media: prev.media.filter((m) => m.id !== mediaId) }));
    } catch {
      // non-fatal
    }
  };

  if (status === "loading") {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-5 bg-parchment-dark/40 rounded w-1/4" />
          <div className="aspect-[4/3] bg-parchment-dark/40 rounded-2xl" />
          <div className="h-7 bg-parchment-dark/40 rounded w-2/3" />
        </div>
      </AppShell>
    );
  }

  if (status === "notfound" || status === "error") {
    return (
      <AppShell>
        <div className="card p-12 text-center max-w-md mx-auto">
          <h3 className="font-serif text-xl text-ink mb-2">
            {status === "notfound" ? "Memory not found" : "Something went wrong"}
          </h3>
          <Link to={`/events/${eventId}`} className="btn-secondary inline-block mt-4">
            Back to chapter
          </Link>
        </div>
      </AppShell>
    );
  }

  const moodStyle = MOOD_STYLES[memory.mood] || MOOD_STYLES.Other;
  const media = memory.media || [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/events/${eventId}`}
            className="text-sm text-bark-light/60 hover:text-bark inline-flex items-center gap-1"
          >
            ← Back to {event?.title || "chapter"}
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => prevId && navigate(`/events/${eventId}/memories/${prevId}`)}
              disabled={!prevId}
              className="p-2 rounded-full hover:bg-parchment-dark/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous memory"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-bark">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-xs text-bark-light/50 px-1">
              {currentIndex + 1} / {siblingIds.length}
            </span>
            <button
              onClick={() => nextId && navigate(`/events/${eventId}/memories/${nextId}`)}
              disabled={!nextId}
              className="p-2 rounded-full hover:bg-parchment-dark/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Next memory"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-bark">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <article className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${moodStyle.bg} ${moodStyle.text}`}>
              <span aria-hidden>{moodStyle.emoji}</span>
              {memory.mood || "No mood set"}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowEditModal(true)} className="btn-secondary text-sm py-1.5 px-3">
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm py-1.5 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {memory.chapter && (
            <p className="text-xs font-medium text-clay-dark uppercase tracking-wide mb-1.5">
              {memory.chapter}
            </p>
          )}

          <h1 className="font-serif text-3xl text-ink leading-snug mb-2">
            {memory.title || "Untitled memory"}
          </h1>

          <div className="flex items-center gap-3 text-sm text-bark-light/60 mb-6">
            {memory.memory_date && <span className="font-hand text-lg text-clay-dark">{formatDateTime(memory.memory_date)}</span>}
            {memory.location_name && (
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {memory.location_name}
              </span>
            )}
          </div>

          {memory.body && (
            <p className="text-ink leading-relaxed whitespace-pre-wrap mb-8 text-[1.05rem]">
              {memory.body}
            </p>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">Photos</h2>
            <label className="text-sm text-clay-dark hover:underline cursor-pointer">
              {uploading ? "Uploading…" : "+ Add photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || media.length >= 5}
                className="hidden"
              />
            </label>
          </div>

          {media.length === 0 ? (
            <p className="text-sm text-bark-light/50 italic mb-4">No photos added yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-4">
              {media.map((item, i) => {
                const rotation = ((i * 7) % 5) - 2;
                return (
                  <div
                    key={item.id}
                    className="polaroid group cursor-pointer transition-transform hover:scale-[1.03] hover:rotate-0"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <div className="aspect-square overflow-hidden bg-parchment-dark relative">
                      <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id); }}
                        className="absolute top-1.5 right-1.5 bg-ink/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {editingCaptionId === item.id ? (
                      <input
                        autoFocus
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveCaption(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => saveCaption(item.id)}
                        className="w-full text-sm font-hand text-center pt-2 bg-transparent focus:outline-none"
                        placeholder="Caption…"
                      />
                    ) : (
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCaptionId(item.id);
                          setCaptionDraft(item.caption || "");
                        }}
                        className="font-hand text-base text-center pt-2 text-bark-light/70 truncate"
                      >
                        {item.caption || "add a caption…"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          media={media}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {showEditModal && (
        <MemoryFormModal
          memory={memory}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-20 px-6">
          <div className="card bg-white p-6 max-w-sm w-full">
            <h3 className="font-serif text-lg text-ink mb-2">Delete this memory?</h3>
            <p className="text-sm text-bark-light/70 mb-6">
              "{memory.title || "This memory"}" will be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1" disabled={deleting}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
