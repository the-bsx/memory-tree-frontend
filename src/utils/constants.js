// Matches backend life_category ENUM exactly
export const EVENT_CATEGORIES = [
  "Travel",
  "Relationship",
  "Career",
  "Health",
  "Goals",
  "Other",
];

// Visual identity per category — used for chips, badges, icons
export const CATEGORY_STYLES = {
  Travel:       { bg: "bg-sage/15",   text: "text-sage-dark",  dot: "bg-sage" },
  Relationship: { bg: "bg-clay/15",   text: "text-clay-dark",  dot: "bg-clay" },
  Career:       { bg: "bg-bark/15",   text: "text-bark-dark",  dot: "bg-bark" },
  Health:       { bg: "bg-red-100",   text: "text-red-700",    dot: "bg-red-400" },
  Goals:        { bg: "bg-amber-100", text: "text-amber-700",  dot: "bg-amber-400" },
  Other:        { bg: "bg-mist/30",   text: "text-bark-light", dot: "bg-mist" },
};

// Matches backend mood ENUM exactly
export const MEMORY_MOODS = [
  "Happy",
  "Sad",
  "Excited",
  "Nostalgic",
  "Grateful",
  "Anxious",
  "Peaceful",
  "Other",
];

// Color + emoji identity per mood — used for path nodes, badges
export const MOOD_STYLES = {
  Happy:     { color: "#D9A441", emoji: "😊", bg: "bg-amber-100",  text: "text-amber-700" },
  Sad:       { color: "#6E8AA8", emoji: "😢", bg: "bg-blue-100",   text: "text-blue-700" },
  Excited:   { color: "#C47B5A", emoji: "🤩", bg: "bg-clay/15",    text: "text-clay-dark" },
  Nostalgic: { color: "#9A7B9A", emoji: "🌅", bg: "bg-purple-100", text: "text-purple-700" },
  Grateful:  { color: "#7A8C6E", emoji: "🙏", bg: "bg-sage/15",    text: "text-sage-dark" },
  Anxious:   { color: "#A65E3E", emoji: "😟", bg: "bg-orange-100", text: "text-orange-700" },
  Peaceful:  { color: "#8FAFA0", emoji: "🕊️", bg: "bg-teal-100",   text: "text-teal-700" },
  Other:     { color: "#BDB5A6", emoji: "✨", bg: "bg-mist/30",    text: "text-bark-light" },
};
