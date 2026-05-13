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
export const NOTE_DEFAULT_CATEGORY = "na";
export const NOTE_CATEGORY_OPTIONS = SEARCH_CATEGORIES.filter(
    (category) => category !== DEFAULT_CATEGORY
);

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
    [VIBE_LEVELS.dead]: "bg-slate-100 text-slate-800 border-slate-300",
    [VIBE_LEVELS.quiet]: "bg-green-400 text-white border-green-500",
    [VIBE_LEVELS.moderate]: "bg-yellow-300 text-black border-yellow-400",
    [VIBE_LEVELS.busy]: "bg-pink-400 text-white border-pink-500",
    [VIBE_LEVELS.buzzing]: "bg-red-500 text-white border-red-600",
};

export const NOTE_MAX_LENGTH = 280;
