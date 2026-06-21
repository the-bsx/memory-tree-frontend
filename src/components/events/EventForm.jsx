import { useState, useRef } from "react";
import { EVENT_CATEGORIES } from "../../utils/constants";

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  isPrivate: false,
  isOngoing: false,
  startedAt: "",
  endedAt: "",
};

export default function EventForm({ initialValues, initialCoverUrl, onSubmit, submitLabel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialCoverUrl || null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Give this chapter a title.");
      return;
    }
    if (!form.category) {
      setError("Pick a category for this chapter.");
      return;
    }
    // started/ended date sanity check, only when both present
    if (form.startedAt && form.endedAt && form.endedAt < form.startedAt) {
      setError("End date can't be before the start date.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("category", form.category);
      if (form.description) formData.append("description", form.description);
      formData.append("isPrivate", form.isPrivate);
      formData.append("isOngoing", form.isOngoing);
      if (form.startedAt) formData.append("startedAt", form.startedAt);
      if (form.endedAt && !form.isOngoing) formData.append("endedAt", form.endedAt);
      if (coverFile) formData.append("cover_image", coverFile);

      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong saving this chapter.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover image */}
      <div>
        <label className="form-label">Cover image</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[16/6] rounded-xl border-2 border-dashed border-mist hover:border-bark transition-colors overflow-hidden bg-parchment flex items-center justify-center relative group"
        >
          {coverPreview ? (
            <>
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-parchment-light text-sm font-medium transition-opacity">
                  Change image
                </span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-mist mx-auto mb-1">
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-bark-light/60">Add a cover image</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="form-label">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          className="input-field"
          placeholder="A chapter of your life…"
        />
      </div>

      {/* Category */}
      <div>
        <label className="form-label">Category</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm({ ...form, category: cat })}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                form.category === cat
                  ? "bg-bark text-parchment-light border-bark"
                  : "bg-parchment-light text-bark-light border-mist hover:border-bark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className="input-field resize-none"
          placeholder="What's this chapter about?"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startedAt" className="form-label">Started</label>
          <input
            id="startedAt"
            name="startedAt"
            type="date"
            value={form.startedAt}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="endedAt" className="form-label">Ended</label>
          <input
            id="endedAt"
            name="endedAt"
            type="date"
            value={form.endedAt}
            onChange={handleChange}
            disabled={form.isOngoing}
            className="input-field disabled:opacity-40"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="isOngoing"
            checked={form.isOngoing}
            onChange={handleChange}
            className="w-4 h-4 rounded accent-bark"
          />
          <span className="text-sm text-ink">This chapter is still ongoing</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="isPrivate"
            checked={form.isPrivate}
            onChange={handleChange}
            className="w-4 h-4 rounded accent-bark"
          />
          <span className="text-sm text-ink">Keep this chapter private</span>
        </label>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Saving…" : submitLabel || "Save"}
      </button>
    </form>
  );
}
