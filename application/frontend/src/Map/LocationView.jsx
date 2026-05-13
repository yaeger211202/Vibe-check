import { useEffect, useMemo, useState } from "react";
import {
    DEFAULT_CURRENT_VIBE,
    NOTE_MAX_LENGTH,
    VIBE_OPTIONS,
    VIBE_STYLES,
} from "./constants.js";
import { addReaction, getReactionsByNote, removeReaction } from "../api/reactions.js";
import { createReply, deleteReply, getRepliesByNote } from "../api/replies.js";

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

function getReactionBuckets(reactions = []) {
    return {
        thumbsUp: reactions.filter((reaction) => reaction.type === "thumbs_up"),
        thumbsDown: reactions.filter((reaction) => reaction.type === "thumbs_down"),
    };
}

function formatRemainingTime(expiresAt, now) {
    if (!expiresAt) return "";

    const expiryTime = new Date(expiresAt).getTime();
    const remainingMs = expiryTime - now;

    if (Number.isNaN(expiryTime) || remainingMs <= 0) return "Expired";

    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (remainingMs < hourMs) return `Expires in ${Math.max(1, Math.floor(remainingMs / minuteMs))}m`;
    if (remainingMs < dayMs) return `Expires in ${Math.floor(remainingMs / hourMs)}h`;
    return `Expires in ${Math.floor(remainingMs / dayMs)}d`;
}

function formatElapsedTime(timestamp, now) {
    if (!timestamp) return "";

    const time = new Date(timestamp).getTime();
    const elapsedMs = now - time;

    if (Number.isNaN(time) || elapsedMs < 0) return "";

    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (elapsedMs < minuteMs) return "Just now";
    if (elapsedMs < hourMs) return `${Math.floor(elapsedMs / minuteMs)}m ago`;
    if (elapsedMs < dayMs) return `${Math.floor(elapsedMs / hourMs)}h ago`;
    return `${Math.floor(elapsedMs / dayMs)}d ago`;
}

export default function LocationView({
                                         selectedLocation,
                                         locationData,
                                         setLocationData,
                                         user,
                                         errorMessage,
                                         onClose,
                                         onSubmitNote,
                                         onDeleteNote,
                                     onReactToNote,
                                     onOpenComments,
                                 }) {
    const [selectedVibe, setSelectedVibe] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [visibleNoteCount, setVisibleNoteCount] = useState(4);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState(null);
    const [currentTime, setCurrentTime] = useState(() => Date.now());
    const [openNoteId, setOpenNoteId] = useState(null);
    const [loadingThreadNoteId, setLoadingThreadNoteId] = useState(null);
    const [noteThreads, setNoteThreads] = useState({});
    const [threadError, setThreadError] = useState("");

    const title = formatLocationTitle(selectedLocation);

<<<<<<< Updated upstream
    const activeLocationId = selectedLocation?.db_id ?? locationData?.locationId ?? null;
=======
    const VIBE_SCORE_MAP = { dead: 1, quiet: 2, moderate: 3, busy: 4, buzzing: 5 };

>>>>>>> Stashed changes
    const currentVibe = locationData?.currentVibe || DEFAULT_CURRENT_VIBE;
    const vibeScore = VIBE_SCORE_MAP[currentVibe?.toLowerCase()] ?? null;
    const progressPercent = vibeScore ? (vibeScore / 5) * 100 : 0;

    const notes = useMemo(() => {
        const rawNotes = Array.isArray(locationData?.notes) ? locationData.notes : [];
        return rawNotes
            .filter((note) => note.locationId === activeLocationId)
            .sort((a, b) => {
            const aTime = new Date(a.createdAt || a.createdAtText || 0).getTime();
            const bTime = new Date(b.createdAt || b.createdAtText || 0).getTime();
            return bTime - aTime;
        });
    }, [activeLocationId, locationData?.notes]);

    const visibleNotes = notes.slice(0, visibleNoteCount);
    const remainingNotes = Math.max(0, notes.length - visibleNoteCount);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

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
        setEditingNoteId(null);
        setSubmitError("");
        setSelectedVibe(null);
        setIsAnonymous(false);
        setNoteText("");
        setOpenNoteId(null);
        setLoadingThreadNoteId(null);
        setNoteThreads({});
        setThreadError("");
    }, [selectedLocation?.db_id, selectedLocation?.id]);

    const canSubmit =
        selectedVibe && noteText.trim().length > 0 && noteText.length <= NOTE_MAX_LENGTH;

    function beginEditNote(note) {
        setEditingNoteId(note.id);
        setSelectedVibe(note.vibe);
        setIsAnonymous(Boolean(note.isAnonymous));
        setNoteText(note.text || "");
        setSubmitError("");
    }

    function resetComposer() {
        setEditingNoteId(null);
        setSelectedVibe(null);
        setIsAnonymous(false);
        setNoteText("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        const payload = {
            noteId: editingNoteId,
            vibe: selectedVibe,
            text: noteText.trim(),
            anonymous: isAnonymous,
        };

        try {
            setIsSubmitting(true);
            setSubmitError("");
            await onSubmitNote?.(payload);
            resetComposer();
        } catch (error) {
            setSubmitError(error.message || "Unable to save note.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function loadThread(noteId) {
        const [reactionsData, repliesData] = await Promise.all([
            getReactionsByNote(noteId),
            getRepliesByNote(noteId),
        ]);

        let nextThread;
        setNoteThreads((prev) => {
            nextThread = {
                reactions: reactionsData.reactions.map((reaction) => ({
                    id: reaction.reaction_id,
                    userId: reaction.user_id,
                    username: reaction.username,
                    type: reaction.reaction_type,
                    createdAt: reaction.created_at,
                })),
                replies: repliesData.replies.map((reply) => ({
                    id: reply.reply_id,
                    noteId: reply.note_id,
                    userId: reply.user_id,
                    username: reply.username,
                    text: reply.content,
                    createdAt: reply.created_at,
                })),
                replyText: prev[noteId]?.replyText || "",
            };

            return {
                ...prev,
                [noteId]: nextThread,
            };
        });

        return nextThread;
    }

    async function toggleThread(noteId) {
        if (openNoteId === noteId) {
            setOpenNoteId(null);
            setLoadingThreadNoteId(null);
            return;
        }

        setThreadError("");
        setOpenNoteId(noteId);
        setLoadingThreadNoteId(noteId);
        setNoteThreads((prev) => ({
            ...prev,
            [noteId]: prev[noteId] || {
                reactions: [],
                replies: [],
                replyText: "",
            },
        }));

        try {
            await loadThread(noteId);
        } catch (error) {
            setThreadError(error.message || "Unable to load note activity.");
        } finally {
            setLoadingThreadNoteId((current) => (current === noteId ? null : current));
        }
    }

    function setReplyText(noteId, value) {
        setNoteThreads((prev) => ({
            ...prev,
            [noteId]: {
                reactions: prev[noteId]?.reactions || [],
                replies: prev[noteId]?.replies || [],
                replyText: value,
            },
        }));
    }

    async function handleReactionToggle(note, reactionType) {
        if (!user?.user_id) {
            setThreadError("Sign in to react to notes.");
            return;
        }

        if (note.userId === user.user_id) {
            setThreadError("You cannot react to your own note.");
            return;
        }

        try {
            setThreadError("");
            const thread = noteThreads[note.id] || await loadThread(note.id);
            const existingReaction = thread.reactions.find((reaction) => reaction.userId === user.user_id);

            if (existingReaction?.type === reactionType) {
                await removeReaction(existingReaction.id);
                const nextReactions = thread.reactions.filter((reaction) => reaction.id !== existingReaction.id);
                setNoteThreads((prev) => ({
                    ...prev,
                    [note.id]: {
                        ...prev[note.id],
                        reactions: nextReactions,
                    },
                }));
                setLocationData((prev) => ({
                    ...prev,
                    notes: prev.notes.map((entry) =>
                        entry.id === note.id
                            ? { ...entry, reactionCount: Math.max(0, (entry.reactionCount ?? 0) - 1) }
                            : entry
                    ),
                }));
                return;
            }

            const data = await addReaction(note.id, reactionType);
            const createdReaction = {
                id: data.reaction.reaction_id,
                userId: data.reaction.user_id,
                username: user.username,
                type: data.reaction.reaction_type,
                createdAt: data.reaction.created_at,
            };
            const nextReactions = existingReaction
                ? thread.reactions.map((reaction) =>
                    reaction.id === existingReaction.id ? createdReaction : reaction
                )
                : [...thread.reactions, createdReaction];

            setNoteThreads((prev) => ({
                ...prev,
                [note.id]: {
                    ...prev[note.id],
                    reactions: nextReactions,
                },
            }));
            if (!existingReaction) {
                setLocationData((prev) => ({
                    ...prev,
                    notes: prev.notes.map((entry) =>
                        entry.id === note.id
                            ? { ...entry, reactionCount: (entry.reactionCount ?? 0) + 1 }
                            : entry
                    ),
                }));
            }
        } catch (error) {
            setThreadError(error.message || "Unable to update reaction.");
        }
    }

    async function handleReplySubmit(noteId) {
        const replyText = noteThreads[noteId]?.replyText?.trim();
        if (!replyText) return;

        if (!user?.user_id) {
            setThreadError("Sign in to reply to notes.");
            return;
        }

        try {
            setThreadError("");
            const data = await createReply({
                note_id: noteId,
                content: replyText,
                is_anonymous: false,
            });

            const createdReply = {
                id: data.reply.reply_id,
                noteId: data.reply.note_id,
                userId: data.reply.user_id,
                username: user.username,
                text: data.reply.content,
                createdAt: data.reply.created_at,
            };

            setNoteThreads((prev) => ({
                ...prev,
                [noteId]: {
                    reactions: prev[noteId]?.reactions || [],
                    replies: [...(prev[noteId]?.replies || []), createdReply],
                    replyText: "",
                },
            }));
            setLocationData((prev) => ({
                ...prev,
                notes: prev.notes.map((entry) =>
                    entry.id === noteId
                        ? { ...entry, commentCount: (entry.commentCount ?? 0) + 1 }
                        : entry
                ),
            }));
        } catch (error) {
            setThreadError(error.message || "Unable to add reply.");
        }
    }

    async function handleReplyDelete(noteId, replyId) {
        try {
            setThreadError("");
            await deleteReply(replyId);
            setNoteThreads((prev) => ({
                ...prev,
                [noteId]: {
                    ...prev[noteId],
                    replies: (prev[noteId]?.replies || []).filter((reply) => reply.id !== replyId),
                },
            }));
            setLocationData((prev) => ({
                ...prev,
                notes: prev.notes.map((entry) =>
                    entry.id === noteId
                        ? { ...entry, commentCount: Math.max(0, (entry.commentCount ?? 0) - 1) }
                        : entry
                ),
            }));
        } catch (error) {
            setThreadError(error.message || "Unable to delete reply.");
        }
    }

    async function handleDelete(note) {
        const noteLabel = note.text?.trim() ? `"${note.text.trim().slice(0, 40)}"` : "this note";
        const confirmed = window.confirm(`Delete ${noteLabel}?`);
        if (!confirmed) return;

        try {
            setDeletingNoteId(note.id);
            setSubmitError("");
            await onDeleteNote?.(note.id);

            if (editingNoteId === note.id) {
                resetComposer();
            }
        } catch (error) {
            setSubmitError(error.message || "Unable to delete note.");
        } finally {
            setDeletingNoteId(null);
        }
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

                {/* Add your vibe */}
                <section className="border-t border-gray-200 pt-5 pb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {editingNoteId ? "Edit your note" : "Add your vibe"}
                    </h3>

                    <form onSubmit={handleSubmit}>
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
                                        disabled={Boolean(editingNoteId)}
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

                            <div className="flex w-full flex-col gap-2 sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className={`w-full sm:min-w-[140px] rounded-2xl px-6 py-4 sm:py-5 text-lg font-semibold text-white transition ${
                                        canSubmit && !isSubmitting
                                            ? "bg-green-400 hover:bg-green-500 hover:cursor-pointer"
                                            : "cursor-not-allowed bg-green-200"
                                    }`}
                                >
                                    {isSubmitting ? "Saving..." : editingNoteId ? "Save" : "Post"}
                                </button>

                                {editingNoteId ? (
                                    <button
                                        type="button"
                                        onClick={resetComposer}
                                        className="w-full rounded-2xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        {submitError ? (
                            <p className="mt-3 text-sm text-red-600">{submitError}</p>
                        ) : null}
                    </form>
                </section>

                {/* Notes */}
                <section>
                    <div className="border-t border-gray-200 pt-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Notes
                        </h3>
                    </div>

                    <div className="mt-4">
                        {errorMessage ? (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        ) : null}

                        {threadError ? (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {threadError}
                            </div>
                        ) : null}

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
                                        (() => {
                                            const threadReactions = noteThreads[note.id]?.reactions || [];
                                            const currentUserReaction = threadReactions.find(
                                                (reaction) => reaction.userId === user?.user_id
                                            );
                                            const { thumbsUp, thumbsDown } = getReactionBuckets(threadReactions);

                                            return (
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
                                                            {note.createdAtText}
                                                            {note.distanceText ? ` · ${note.distanceText}` : ""}
                                                        </p>
                                                        <p className="text-xs text-amber-700">
                                                            {formatRemainingTime(note.expiresAt, currentTime)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize shrink-0 ${getNoteVibeClass(note.vibe)}`}
                                                >
                                                    {note.vibe || "Unknown"}
                                                </span>
                                            </div>

                                            {note.locationName ? (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                                                        {note.locationName}
                                                    </span>
                                                    {note.category && note.category !== "na" ? (
                                                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                                                            {note.category}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}

                                            <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-800">
                                                {note.text || ""}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleThread(note.id)}
                                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 hover:cursor-pointer"
                                                    aria-label={`View reactions for note by ${note.username || note.displayName || "anonymous user"}`}
                                                >
                                                    Reactions {note.reactionCount ?? 0}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleThread(note.id)}
                                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 hover:cursor-pointer"
                                                    aria-label={`View comments for note by ${note.username || note.displayName || "anonymous user"}`}
                                                >
                                                    Replies {note.commentCount ?? 0}
                                                </button>

                                                {note.userId !== user?.user_id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReactionToggle(note, "thumbs_up")}
                                                            className={`rounded-full border px-3 py-1 text-sm transition hover:cursor-pointer ${
                                                                currentUserReaction?.type === "thumbs_up"
                                                                    ? "border-green-300 bg-green-100 text-green-800"
                                                                    : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                                            }`}
                                                        >
                                                            👍 Thumbs up
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReactionToggle(note, "thumbs_down")}
                                                            className={`rounded-full border px-3 py-1 text-sm transition hover:cursor-pointer ${
                                                                currentUserReaction?.type === "thumbs_down"
                                                                    ? "border-red-300 bg-red-100 text-red-800"
                                                                    : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                                            }`}
                                                        >
                                                            👎 Thumbs down
                                                        </button>
                                                    </>
                                                ) : null}

                                                {note.userId === user?.user_id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => beginEditNote(note)}
                                                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 transition hover:bg-blue-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(note)}
                                                            disabled={deletingNoteId === note.id}
                                                            className={`rounded-full border px-3 py-1 text-sm transition ${
                                                                deletingNoteId === note.id
                                                                    ? "cursor-not-allowed border-red-100 bg-red-50 text-red-300"
                                                                    : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                                            }`}
                                                        >
                                                            {deletingNoteId === note.id ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </>
                                                ) : null}
                                            </div>

                                            {openNoteId === note.id ? (
                                                <div className="mt-4 space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                                    {loadingThreadNoteId === note.id ? (
                                                        <p className="text-sm text-gray-500">Loading activity...</p>
                                                    ) : null}

                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                            Reactions
                                                        </h4>
                                                        {threadReactions.length === 0 ? (
                                                            <p className="mt-2 text-sm text-gray-500">No reactions yet.</p>
                                                        ) : (
                                                            <div className="mt-2 space-y-3">
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                                                        👍 Thumbs up
                                                                    </p>
                                                                    {thumbsUp.length === 0 ? (
                                                                        <p className="mt-1 text-sm text-gray-500">No thumbs up yet.</p>
                                                                    ) : (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {thumbsUp.map((reaction) => (
                                                                                <span
                                                                                    key={reaction.id}
                                                                                    className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-medium text-green-800"
                                                                                >
                                                                                    {reaction.username}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                                                                        👎 Thumbs down
                                                                    </p>
                                                                    {thumbsDown.length === 0 ? (
                                                                        <p className="mt-1 text-sm text-gray-500">No thumbs down yet.</p>
                                                                    ) : (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {thumbsDown.map((reaction) => (
                                                                                <span
                                                                                    key={reaction.id}
                                                                                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-800"
                                                                                >
                                                                                    {reaction.username}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                            Replies
                                                        </h4>
                                                        <div className="mt-2 space-y-3">
                                                            {(noteThreads[note.id]?.replies || []).length === 0 ? (
                                                                <p className="text-sm text-gray-500">No replies yet.</p>
                                                            ) : (
                                                                (noteThreads[note.id]?.replies || []).map((reply) => (
                                                                    <div
                                                                        key={reply.id}
                                                                        className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">
                                                                                    {reply.username}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {formatElapsedTime(reply.createdAt, currentTime)}
                                                                                </p>
                                                                            </div>
                                                                            {reply.userId === user?.user_id ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleReplyDelete(note.id, reply.id)}
                                                                                    className="text-xs font-medium text-red-600 transition hover:text-red-700"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            ) : null}
                                                                        </div>
                                                                        <p className="mt-2 text-sm text-gray-800">
                                                                            {reply.text}
                                                                        </p>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {note.userId !== user?.user_id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                rows="3"
                                                                value={noteThreads[note.id]?.replyText || ""}
                                                                onChange={(event) => setReplyText(note.id, event.target.value)}
                                                                placeholder="Write a reply..."
                                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            />
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReplySubmit(note.id)}
                                                                    className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                                                                >
                                                                    Reply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </article>
                                            );
                                        })()
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
            </div>
        </aside>
    );
}
