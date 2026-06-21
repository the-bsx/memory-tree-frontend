// Generates x/y coordinates for memory nodes along a winding vertical path,
// inspired by Candy Crush level-select screens — but grounded in real time:
// memories further apart in time sit further apart on the path.

const TOP_PADDING = 100;
const BOTTOM_PADDING = 80;

// Vertical spacing bounds — even same-day memories get some breathing room,
// and even huge time gaps don't stretch the path into the stratosphere.
const MIN_SPACING_Y = 170;
const MAX_SPACING_Y = 420;
const DEFAULT_SPACING_Y = 230; // used when there's no date info to go on

// Node size bounds — memories with more "weight" (photos + longer text)
// render as slightly bigger stops on the trail, like milestone levels.
const BASE_NODE_SIZE = 116; // px, was 80 — nodes need real visual presence
const MIN_NODE_SCALE = 0.9;
const MAX_NODE_SCALE = 1.35;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Maps a list of memories (assumed already sorted oldest -> newest) into
// vertical spacing values, based on the real time elapsed between them.
function computeSpacings(memories) {
  const gaps = [];
  for (let i = 1; i < memories.length; i++) {
    const prevDate = memories[i - 1].memory_date ? new Date(memories[i - 1].memory_date) : null;
    const currDate = memories[i].memory_date ? new Date(memories[i].memory_date) : null;
    if (!prevDate || !currDate) {
      gaps.push(null); // missing date info, fall back to default spacing later
      continue;
    }
    const diffDays = Math.max(0, (currDate - prevDate) / (1000 * 60 * 60 * 24));
    gaps.push(diffDays);
  }

  const knownGaps = gaps.filter((g) => g !== null);
  const maxGap = knownGaps.length > 0 ? Math.max(...knownGaps, 1) : 1;

  // Log scale so a 2-day gap and a 200-day gap don't differ by 100x in pixels —
  // it should *read* as "further apart" without breaking the page length.
  return gaps.map((gap) => {
    if (gap === null) return DEFAULT_SPACING_Y;
    const normalized = Math.log(gap + 1) / Math.log(maxGap + 1); // 0 to 1
    return Math.round(MIN_SPACING_Y + normalized * (MAX_SPACING_Y - MIN_SPACING_Y));
  });
}

// Weight = how much "presence" a memory should have on the path.
// More photos and a longer story both nudge the node bigger.
function computeNodeScale(memory) {
  const photoCount = memory.media?.length || 0;
  const textLength = (memory.body || "").length;
  const weight = clamp(photoCount / 4 + textLength / 600, 0, 1);
  return MIN_NODE_SCALE + weight * (MAX_NODE_SCALE - MIN_NODE_SCALE);
}

// Builds full node layout given the available lane width (responsive —
// pass in the actual rendered container width so the path fills the screen
// rather than sitting in a fixed 360px column).
export function generatePathNodes(memories, laneWidth) {
  const centerX = laneWidth / 2;
  // Amplitude now uses much more of the available width — the trail should
  // feel like it's actually using the page, not floating in a thin column.
  const amplitude = clamp(laneWidth * 0.38, 110, 320);
  const edgeMargin = BASE_NODE_SIZE * MAX_NODE_SCALE * 0.55;
  const spacings = computeSpacings(memories);

  const nodes = [];
  let y = TOP_PADDING;

  for (let i = 0; i < memories.length; i++) {
    if (i > 0) y += spacings[i - 1];

    // Sine wave swing for the organic left-right curve, with a touch of
    // per-node jitter so it doesn't feel like a perfect repeating function.
    const jitter = Math.sin(i * 2.7) * (amplitude * 0.12);
    const swing = Math.sin(i * 0.95) * amplitude + jitter;

    nodes.push({
      x: clamp(centerX + swing, edgeMargin, laneWidth - edgeMargin),
      y,
      scale: computeNodeScale(memories[i]),
    });
  }

  return { nodes, totalHeight: y + BOTTOM_PADDING };
}

// Builds a smooth SVG path string ("d" attribute) connecting node centers
// with cubic bezier curves, so the connecting line/rope looks organic.
export function buildSmoothPath(nodes) {
  if (nodes.length === 0) return "";
  if (nodes.length === 1) return `M ${nodes[0].x} ${nodes[0].y}`;

  let d = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    const midY = (curr.y + next.y) / 2;
    d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
  }

  return d;
}

export const PATH_TOP_PADDING = TOP_PADDING;
export const PATH_BASE_NODE_SIZE = BASE_NODE_SIZE;
