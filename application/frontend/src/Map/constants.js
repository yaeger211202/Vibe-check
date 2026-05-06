export const SEARCH_CATEGORIES = [
    "All Categories",
    "Restaurant",
    "Libraries",
    "Bar",
    "Cafe",
    "Park",
    "Museum",
    "Shopping",
    "Entertainment",
    "Nightlife",
];

export const DEFAULT_CATEGORY = SEARCH_CATEGORIES[0];

export const VIBE_LEVELS = {
    all: "all",
    dead: "dead",
    quiet: "quiet",
    moderate: "moderate",
    busy: "busy",
    buzzing: "buzzing",
    unknown: "unknown",
};

export const DEFAULT_VIBE_LEVEL = VIBE_LEVELS.all;
export const DEFAULT_CURRENT_VIBE = VIBE_LEVELS.unknown;

export const VIBE_FILTER_OPTIONS = [
    { value: VIBE_LEVELS.all, label: "All Vibes", color: "bg-black text-white" },
    { value: VIBE_LEVELS.dead, label: "Dead", color: "bg-slate-200" },
    { value: VIBE_LEVELS.quiet, label: "Quiet", color: "bg-green-400 text-white" },
    { value: VIBE_LEVELS.moderate, label: "Moderate", color: "bg-yellow-300 text-black" },
    { value: VIBE_LEVELS.busy, label: "Busy", color: "bg-pink-400 text-white" },
    { value: VIBE_LEVELS.buzzing, label: "Buzzing", color: "bg-red-500 text-white" },
];

export const VIBE_OPTIONS = [
    VIBE_LEVELS.dead,
    VIBE_LEVELS.quiet,
    VIBE_LEVELS.moderate,
    VIBE_LEVELS.busy,
    VIBE_LEVELS.buzzing,
];

export const VIBE_STYLES = {
    [VIBE_LEVELS.dead]: "bg-gray-300 text-gray-900 border-gray-500",
    [VIBE_LEVELS.quiet]: "bg-green-100 text-green-700 border-green-300",
    [VIBE_LEVELS.moderate]: "bg-yellow-100 text-yellow-800 border-yellow-400",
    [VIBE_LEVELS.busy]: "bg-red-100 text-red-700 border-red-300",
    [VIBE_LEVELS.buzzing]: "bg-pink-100 text-pink-700 border-pink-300",
};

export const NOTE_MAX_LENGTH = 280;
