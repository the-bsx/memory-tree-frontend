import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MOOD_STYLES } from "../../utils/constants";

function formatShortDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Positions itself near the clicked node (anchorRect), but clamps to stay
// fully on-screen — flips above the node if there isn't room below, and
// shifts horizontally if it would overflow the viewport edges.
export default function MemoryPeekPopover({ memory, eventId, anchorRect, onClose }) {
  const popoverRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0 });
  const moodStyle = MOOD_STYLES[memory.mood] || MOOD_STYLES.Other;
  const thumbnail = memory.media?.[0]?.url;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (!anchorRect || !popoverRef.current) return;

    const popoverWidth = 280;
    const popoverHeight = popoverRef.current.offsetHeight || 260;
    const margin = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
    left = Math.max(margin, Math.min(left, viewportWidth - popoverWidth - margin));

    const spaceBelow = viewportHeight - anchorRect.bottom;
    const placeAbove = spaceBelow < popoverHeight + margin && anchorRect.top > popoverHeight + margin;

    const top = placeAbove
      ? anchorRect.top - popoverHeight - margin
      : anchorRect.bottom + margin;

    setStyle({
      position: "fixed",
      left,
      top,
      opacity: 1,
    });
  }, [anchorRect]);

  return (
    <div
      ref={popoverRef}
      className="z-30 w-[280px] card bg-white shadow-xl animate-pop-in overflow-hidden"
      style={style}
    >
      {thumbnail && (
        <div className="aspect-[4/3] bg-parchment-dark">
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${moodStyle.bg} ${moodStyle.text}`}>
            <span aria-hidden>{moodStyle.emoji}</span>
            {memory.mood || "—"}
          </span>
          <button
            onClick={onClose}
            className="text-bark-light/40 hover:text-bark p-0.5 rounded-full hover:bg-parchment transition-colors shrink-0"
            aria-label="Close"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <h3 className="font-serif text-base text-ink leading-snug mb-1 line-clamp-1">
          {memory.title || "Untitled memory"}
        </h3>

        {memory.memory_date && (
          <p className="font-hand text-base text-clay-dark leading-none mb-1.5">
            {formatShortDate(memory.memory_date)}
          </p>
        )}

        {memory.body && (
          <p className="text-sm text-bark-light/80 line-clamp-2 mb-3">{memory.body}</p>
        )}

        <Link
          to={`/events/${eventId}/memories/${memory.id}`}
          className="btn-primary w-full text-center text-sm py-2 block"
        >
          View full memory
        </Link>
      </div>
    </div>
  );
}
