import { useEffect, useCallback } from "react";

export default function ImageLightbox({ media, activeIndex, onClose, onNavigate }) {
  const goPrev = useCallback(() => {
    onNavigate((activeIndex - 1 + media.length) % media.length);
  }, [activeIndex, media.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((activeIndex + 1) % media.length);
  }, [activeIndex, media.length, onNavigate]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  const current = media[activeIndex];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 bg-ink/95 z-50 flex flex-col items-center justify-center px-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-parchment-light/70 hover:text-parchment-light p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {media.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-parchment-light/70 hover:text-parchment-light p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Previous photo"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-parchment-light/70 hover:text-parchment-light p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Next photo"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      <img
        src={current.url}
        alt={current.caption || ""}
        className="max-w-full max-h-[80vh] object-contain rounded-sm animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      />

      {current.caption && (
        <p className="font-hand text-xl text-parchment-light mt-4 max-w-lg text-center px-4">
          {current.caption}
        </p>
      )}

      {media.length > 1 && (
        <div className="flex gap-1.5 mt-5">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onNavigate(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIndex ? "bg-parchment-light" : "bg-parchment-light/30"
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
