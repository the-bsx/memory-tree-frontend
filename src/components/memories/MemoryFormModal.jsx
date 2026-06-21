import { useState, useRef, useEffect } from "react";
import { MEMORY_MOODS } from "../../utils/constants";

const EMPTY_FORM = {
  title: "",
  body: "",
  chapter: "",
  mood: "",
  moodScore: "",
  locationName: "",
  memoryDate: "",
};

function toFormValues(memory) {
  if (!memory) return EMPTY_FORM;
  return {
    title: memory.title || "",
    body: memory.body || "",
    chapter: memory.chapter || "",
    mood: memory.mood || "",
    moodScore: memory.mood_score ?? "",
    locationName: memory.location_name || "",
    memoryDate: memory.memory_date ? memory.memory_date.slice(0, 10) : "",
  };
}

export default function MemoryFormModal({ memory, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormValues(memory));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!memory;

  // Photos are only relevant on create — editing already has its own
  // gallery management inside MemoryModal once the memory exists.
  const [selectedFiles, setSelectedFiles] = useState([]); // [{ file, previewUrl }]
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - selectedFiles.length;
    const accepted = files.slice(0, remainingSlots);

    const withPreviews = accepted.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...withPreviews]);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Revoke any remaining preview URLs when the modal unmounts, to avoid
  // leaking blob URLs if the user closes without submitting.
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.moodScore && (Number(form.moodScore) < 1 || Number(form.moodScore) > 10)) {
      setError("Mood score should be between 1 and 10.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title || undefined,
        body: form.body || undefined,
        chapter: form.chapter || undefined,
        mood: form.mood || undefined,
        moodScore: form.moodScore ? Number(form.moodScore) : undefined,
        locationName: form.locationName || undefined,
        memoryDate: form.memoryDate || undefined,
      };
      const files = selectedFiles.map((f) => f.file);
      await onSubmit(payload, files);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save this memory.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-30 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="card bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-parchment-dark sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">
            {isEditing ? "Edit memory" : "New memory"}
          </h2>
          <button
            onClick={onClose}
            className="text-bark-light/50 hover:text-bark p-1 rounded-full hover:bg-parchment transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isEditing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Photos (optional)</label>
                <span className="text-xs text-bark-light/50">{selectedFiles.length}/5</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedFiles.map((item, index) => (
                  <div key={item.previewUrl} className="relative w-16 h-16 rounded-lg overflow-hidden border border-parchment-dark group">
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="absolute top-0.5 right-0.5 bg-ink/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}

                {selectedFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-mist hover:border-bark transition-colors flex items-center justify-center bg-parchment-light shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-mist">
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
              <p className="text-xs text-bark-light/50 mt-2">
                You can add more photos later too.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className="input-field"
              placeholder="A small moment worth keeping…"
            />
          </div>

          <div>
            <label htmlFor="body" className="form-label">Story</label>
            <textarea
              id="body"
              name="body"
              rows={4}
              value={form.body}
              onChange={handleChange}
              className="input-field resize-none"
              placeholder="What happened?"
            />
          </div>

          <div>
            <label htmlFor="chapter" className="form-label">Chapter (optional grouping)</label>
            <input
              id="chapter"
              name="chapter"
              type="text"
              value={form.chapter}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Day 1, Week 3…"
            />
          </div>

          <div>
            <label className="form-label">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MEMORY_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mood: form.mood === m ? "" : m })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.mood === m
                      ? "bg-bark text-parchment-light border-bark"
                      : "bg-parchment-light text-bark-light border-mist hover:border-bark"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="moodScore" className="form-label">Mood score (1–10)</label>
              <input
                id="moodScore"
                name="moodScore"
                type="number"
                min={1}
                max={10}
                value={form.moodScore}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 8"
              />
            </div>
            <div>
              <label htmlFor="memoryDate" className="form-label">Date</label>
              <input
                id="memoryDate"
                name="memoryDate"
                type="date"
                value={form.memoryDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="locationName" className="form-label">Location</label>
            <input
              id="locationName"
              name="locationName"
              type="text"
              value={form.locationName}
              onChange={handleChange}
              className="input-field"
              placeholder="Where did this happen?"
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting
              ? selectedFiles.length > 0 ? "Saving & uploading photos…" : "Saving…"
              : isEditing ? "Save changes" : "Add memory"}
          </button>
        </form>
      </div>
    </div>
  );
}
