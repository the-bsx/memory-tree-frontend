import { useEffect, useRef, useState } from "react";
import { MOOD_STYLES } from "../../utils/constants";
import { PATH_BASE_NODE_SIZE } from "../../utils/pathLayout";

export default function MemoryNode({ memory, x, y, scale = 1, index, onClick }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const moodStyle = MOOD_STYLES[memory.mood] || MOOD_STYLES.Other;
  const thumbnail = memory.media?.[0]?.url;
  const baseSize = PATH_BASE_NODE_SIZE;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Slight per-node animation offset so nodes don't all "breathe" in lockstep —
  // gives the trail a gentle, alive feel even when the user isn't scrolling.
  const idleDelay = (index % 5) * 0.4;

  return (
    <button
      ref={ref}
      onClick={(e) => onClick(memory, e.currentTarget.getBoundingClientRect())}
      className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
      style={{
        left: x,
        top: y,
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translate(-50%, -50%) scale(${scale})`
          : "translate(-50%, -30%) scale(0.5)",
        transition: "opacity 0.55s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transitionDelay: visible ? `${(index % 6) * 70}ms` : "0ms",
      }}
    >
      <div
        className="rounded-full flex items-center justify-center relative shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 group-active:scale-95 transition-all duration-200 bg-cover bg-center animate-node-idle"
        style={{
          width: baseSize,
          height: baseSize,
          backgroundColor: thumbnail ? undefined : moodStyle.color,
          backgroundImage: thumbnail ? `url(${thumbnail})` : undefined,
          border: "5px solid #FBF6EE",
          boxShadow: `0 0 0 4px ${moodStyle.color}40, 0 10px 20px -8px rgba(44,31,20,0.35)`,
          animationDelay: `${idleDelay}s`,
        }}
      >
        {!thumbnail && (
          <span className="text-5xl select-none" aria-hidden>
            {moodStyle.emoji}
          </span>
        )}
        {thumbnail && (
          <span
            className="absolute -bottom-1.5 -right-1.5 text-xl leading-none bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md"
            aria-hidden
          >
            {moodStyle.emoji}
          </span>
        )}
      </div>

      <p
        className="mt-3 text-sm font-semibold text-bark text-center leading-snug"
        style={{ maxWidth: baseSize * 1.25 }}
      >
        <span className="line-clamp-2">{memory.title || "Untitled memory"}</span>
      </p>
    </button>
  );
}
