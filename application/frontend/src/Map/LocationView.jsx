import { useEffect, useMemo, useState } from "react";
import {
    DEFAULT_CURRENT_VIBE,
    NOTE_MAX_LENGTH,
    VIBE_OPTIONS,
    VIBE_STYLES,
} from "./constants.js";

function formatLocationTitle(location) {
    const name = location?.name?.trim();
    const address = location?.address?.trim();
    return name || address || "Location";
}

function getNoteVibeClass(vibe) {
    return VIBE_STYLES[vibe?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-300";
}

function getInitials(name) {
    if (!name) return "?";
    return name.replace("@", "").trim()[0]?.toUpperCase() || "?";
}

export default function LocationView({
                                         selectedLocation,
                                         locationData,
                                         setLocationData,
                                         onClose,
                                         onSubmitNote,
                                         onReactToNote,
                                         onOpenComments,
                                     }) {
    const [selectedVibe, setSelectedVibe] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [visibleNoteCount, setVisibleNoteCount] = useState(4);

    const title = formatLocationTitle(selectedLocation);

    const currentVibe = locationData?.currentVibe || DEFAULT_CURRENT_VIBE;
    const progressPercent = locationData?.vibeScorePercent || 0;

    const notes = useMemo(() => {
        const rawNotes = Array.isArray(locationData?.notes) ? locationData.notes : [];
        return [...rawNotes].sort((a, b) => {
            const aTime = new Date(a.createdAt || a.createdAtText || 0).getTime();
            const bTime = new Date(b.createdAt || b.createdAtText || 0).getTime();
            return bTime - aTime;
        });
    }, [locationData]);

    const visibleNotes = notes.slice(0, visibleNoteCount);
    const remainingNotes = Math.max(0, notes.length - visibleNoteCount);

    useEffect(() => {
        if (!locationData?.notes?.length) return;

        const interval = setInterval(() => {
            setLocationData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    notes: prev.notes.filter(n => {
                        if (!n.expiresAt) return true;
                        return new Date(n.expiresAt) > new Date();
                    })
                };
            });
        }, 60 * 1000); // check every minute

        return () => clearInterval(interval);
    }, [locationData?.notes]);

    useEffect(() => {
        setVisibleNoteCount(4);
    }, [selectedLocation?.id]);

    const canSubmit =
        selectedVibe && noteText.trim().length > 0 && noteText.length <= NOTE_MAX_LENGTH;

    function handleSubmit(e) {
        e.preventDefault();
        console.log('handleSubmit fired', { canSubmit, selectedVibe, noteText });

        if (!canSubmit) return;

        const payload = {
            locationId: selectedLocation?.id ?? null,
            vibe: selectedVibe,
            text: noteText.trim(),
            anonymous: isAnonymous,
        };

        console.log('calling onSubmitNote with payload:', payload);

        onSubmitNote?.(payload);

        setNoteText("");
        setSelectedVibe(null);
        setIsAnonymous(false);
    }

    return (
        <aside className="h-full overflow-y-auto bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 px-4 sm:px-5 py-4 sticky top-0 bg-white z-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl leading-none text-gray-400 transition hover:text-gray-700 hover:cursor-pointer shrink-0"
                        aria-label="Close location panel"
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="px-4 sm:px-5 py-4 space-y-6">
                {/* Vibe Score */}
                <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Vibe Score
                    </h3>

                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-yellow-500 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <div
                            className={`rounded-xl border px-3 sm:px-5 py-2 text-sm sm:text-lg font-semibold capitalize shrink-0 ${getNoteVibeClass(currentVibe)}`}
                        >
                            {currentVibe}
                        </div>
                    </div>
                </section>

                {/* Notes */}
                <section>
                    <div className="border-t border-gray-200 pt-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Notes
                        </h3>
                    </div>

                    <div className="mt-4">
                        {notes.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                <p className="text-base font-medium text-gray-700">
                                    No notes at the moment
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Be the first to share the current vibe for this place.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 sm:space-y-4">
                                    {visibleNotes.map((note) => (
                                        <article
                                            key={note.id}
                                            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 gap-3">
                                                    {/* Avatar — smaller on mobile */}
                                                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base sm:text-lg font-semibold text-gray-700">
                                                        {getInitials(note.username || note.displayName)}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="truncate text-base sm:text-lg font-semibold text-gray-900">
                                                            {note.username || note.displayName || "Anonymous"}
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {note.createdAtText || "Just now"}
                                                            {note.distanceText ? ` · ${note.distanceText}` : ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize shrink-0 ${getNoteVibeClass(note.vibe)}`}
                                                >
                                                    {note.vibe || "Unknown"}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-800">
                                                {note.text || ""}
                                            </p>

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onReactToNote?.(note.id)}
                                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
                                                    aria-label={`React to note by ${note.username || note.displayName || "anonymous user"}`}
                                                >
                                                    👍 {note.reactionCount ?? 0}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onOpenComments?.(note.id)}
                                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
                                                    aria-label={`View comments for note by ${note.username || note.displayName || "anonymous user"}`}
                                                >
                                                    💬 {note.commentCount ?? 0}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {remainingNotes > 0 && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setVisibleNoteCount((prev) => prev + 4)}
                                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline hover:cursor-pointer"
                                        >
                                            See {remainingNotes} more {remainingNotes === 1 ? "note" : "notes"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Add your vibe */}
                <section className="border-t border-gray-200 pt-5 pb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Add your vibe
                    </h3>

                    <form onSubmit={handleSubmit}>
                        {/* Vibe pill buttons — wrap naturally */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {VIBE_OPTIONS.map((option) => {
                                const isSelected = selectedVibe === option;
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setSelectedVibe(option)}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition hover:cursor-pointer ${
                                            isSelected
                                                ? getNoteVibeClass(option)
                                                : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Textarea + submit — stacks on mobile */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 rounded-2xl border border-gray-300 bg-white p-4">
                                <textarea
                                    rows="4"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                                    placeholder="What's the vibe right now?"
                                    className="w-full resize-none border-none text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
                                />

                                <div className="mt-3 flex items-center justify-between gap-4 text-sm text-gray-500">
                                    <span>{noteText.length} / {NOTE_MAX_LENGTH}</span>

                                    <button
                                        type="button"
                                        onClick={() => setIsAnonymous((prev) => !prev)}
                                        className="flex items-center gap-2"
                                        aria-pressed={isAnonymous}
                                    >
                                        <span className="text-sm text-gray-600">Anonymous</span>

                                        <div
                                            className={`relative h-6 w-11 rounded-full transition ${
                                                isAnonymous ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                                    isAnonymous ? "left-5" : "left-0.5"
                                                }`}
                                            />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Full-width on mobile, auto width on sm+ */}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className={`w-full sm:w-auto sm:min-w-[120px] rounded-2xl px-6 py-4 sm:py-5 text-lg font-semibold text-white transition ${
                                    canSubmit
                                        ? "bg-green-400 hover:bg-green-500 hover:cursor-pointer"
                                        : "cursor-not-allowed bg-green-200"
                                }`}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </aside>
    );
}
