import { Link } from "react-router-dom";
import { CATEGORY_STYLES } from "../../utils/constants";

function formatDateRange(startedAt, endedAt, isOngoing) {
  if (!startedAt) return null;
  const start = new Date(startedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (isOngoing) return `${start} — present`;
  if (!endedAt) return start;
  const end = new Date(endedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return start === end ? start : `${start} — ${end}`;
}

export default function EventCard({ event }) {
  const style = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.Other;
  const dateLabel = formatDateRange(event.started_at, event.ended_at, event.is_ongoing);

  return (
    <Link
      to={`/events/${event.id}`}
      className="card group overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[16/9] bg-parchment-dark relative overflow-hidden">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-mist">
              <path
                d="M12 2C12 2 7 6 7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11C17 6 12 2 12 2Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
              />
              <path d="M12 17V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {event.is_private && (
          <div className="absolute top-3 right-3 bg-ink/60 backdrop-blur-sm rounded-full p-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-parchment-light">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {event.category}
          </span>
          {event.is_ongoing && (
            <span className="text-xs text-sage-dark font-medium">● Ongoing</span>
          )}
        </div>

        <h3 className="font-serif text-lg text-ink leading-snug mb-1 line-clamp-1">
          {event.title}
        </h3>

        {dateLabel && <p className="text-xs text-bark-light/60 mb-1.5">{dateLabel}</p>}

        {event.description && (
          <p className="text-sm text-bark-light/80 line-clamp-2">{event.description}</p>
        )}
      </div>
    </Link>
  );
}
