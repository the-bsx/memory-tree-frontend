import { Link } from "react-router-dom";
import { MOOD_STYLES } from "../../utils/constants";

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function StoryMode({ eventId, memories }) {
  const sorted = [...memories].sort(
    (a, b) => new Date(a.memory_date || 0) - new Date(b.memory_date || 0)
  );

  return (
    <div className="max-w-xl mx-auto space-y-12 pb-12">
      {sorted.map((memory, i) => {
        const moodStyle = MOOD_STYLES[memory.mood] || MOOD_STYLES.Other;
        const thumbnail = memory.media?.[0]?.url;

        return (
          <div key={memory.id} className="relative">
            {i < sorted.length - 1 && (
              <div className="absolute left-[19px] top-12 bottom-[-3rem] w-px bg-mist/50" />
            )}

            <div className="flex gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg shadow-sm border-2 border-parchment-light"
                style={{ backgroundColor: moodStyle.color }}
                aria-hidden
              >
                {moodStyle.emoji}
              </div>

              <div className="flex-1 min-w-0">
                {memory.memory_date && (
                  <p className="font-hand text-lg text-clay-dark leading-none mb-1">
                    {formatDateTime(memory.memory_date)}
                  </p>
                )}

                <Link to={`/events/${eventId}/memories/${memory.id}`} className="group">
                  <h3 className="font-serif text-xl text-ink leading-snug mb-2 group-hover:text-clay-dark transition-colors">
                    {memory.title || "Untitled memory"}
                  </h3>
                </Link>

                {thumbnail && (
                  <Link to={`/events/${eventId}/memories/${memory.id}`}>
                    <div className="rounded-xl overflow-hidden mb-3 max-h-72 bg-parchment-dark">
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  </Link>
                )}

                {memory.body && (
                  <p className="text-ink/90 leading-relaxed mb-2 line-clamp-4">{memory.body}</p>
                )}

                <Link
                  to={`/events/${eventId}/memories/${memory.id}`}
                  className="text-sm text-clay-dark hover:underline font-medium"
                >
                  Read full memory →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
