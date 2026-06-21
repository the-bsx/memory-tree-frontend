import { useEffect, useRef, useState, useMemo } from "react";
import MemoryNode from "./MemoryNode";
import { generatePathNodes, buildSmoothPath, PATH_TOP_PADDING } from "../../utils/pathLayout";
import { easeOutCubic } from "../../utils/easing";

// Small decorative marks scattered along the trail — leaves, dots, a tiny
// flower — so the path reads as a hand-drawn trail rather than a function plot.
function ScatterDecorations({ nodes, laneWidth }) {
  const decorations = useMemo(() => {
    const items = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const t = 0.5 + Math.sin(i * 1.7) * 0.18; // place along the segment, not always centered
      const midX = a.x + (b.x - a.x) * t;
      const midY = a.y + (b.y - a.y) * t;
      const side = Math.cos(i * 2.1) > 0 ? 1 : -1;
      const offset = 64 + (i % 3) * 16;
      items.push({
        key: `deco-${i}`,
        x: clamp(midX + side * offset, 16, laneWidth - 16),
        y: midY,
        kind: i % 3,
        rotation: (i * 47) % 360,
      });
    }
    return items;
  }, [nodes, laneWidth]);

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  return (
    <>
      {decorations.map((d) => (
        <g key={d.key} transform={`translate(${d.x}, ${d.y}) scale(1.6) rotate(${d.rotation})`} opacity="0.4">
          {d.kind === 0 && (
            <path d="M0 -5 C 4 -5, 5 0, 0 6 C -5 0, -4 -5, 0 -5 Z" fill="#7A8C6E" />
          )}
          {d.kind === 1 && <circle r="2.5" fill="#C47B5A" />}
          {d.kind === 2 && (
            <path d="M-4 0 L4 0 M0 -4 L0 4" stroke="#BDB5A6" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </g>
      ))}
    </>
  );
}

export default function MemoryPath({ memories, onNodeClick }) {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [laneWidth, setLaneWidth] = useState(360);
  const [drawProgress, setDrawProgress] = useState(0); // eased 0 to 1

  // Track the rendered width of the wrapper so the path fills available
  // space responsively instead of sitting in a fixed-width column.
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setLaneWidth(Math.min(width, 980));
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const { nodes, totalHeight } = useMemo(
    () => generatePathNodes(memories, laneWidth),
    [memories, laneWidth]
  );
  const pathD = useMemo(() => buildSmoothPath(nodes), [nodes]);

  useEffect(() => {
    let raf = null;

    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibleBottom = viewportHeight - rect.top;
        const rawProgress = Math.max(0, Math.min(1, visibleBottom / rect.height));
        setDrawProgress(easeOutCubic(rawProgress));
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [memories.length, laneWidth]);

  if (memories.length === 0) return null;

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{ width: laneWidth, height: totalHeight + PATH_TOP_PADDING }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={laneWidth}
          height={totalHeight + PATH_TOP_PADDING}
          viewBox={`0 0 ${laneWidth} ${totalHeight + PATH_TOP_PADDING}`}
        >
          <defs>
            <linearGradient id="ropeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C47B5A" />
              <stop offset="100%" stopColor="#7A8C6E" />
            </linearGradient>
            <filter id="ropeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2C1F14" floodOpacity="0.18" />
            </filter>
          </defs>

          <path
            d={pathD}
            fill="none"
            stroke="#E8D9BC"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="3 20"
          />

          <ScatterDecorations nodes={nodes} laneWidth={laneWidth} />

          <path
            d={pathD}
            fill="none"
            stroke="url(#ropeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - drawProgress}
            filter="url(#ropeShadow)"
          />
        </svg>

        {memories.map((memory, i) => (
          <MemoryNode
            key={memory.id}
            memory={memory}
            x={nodes[i].x}
            y={nodes[i].y}
            scale={nodes[i].scale}
            index={i}
            onClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
}
