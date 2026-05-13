import { apiRequest } from "./client.js";

export function getReactionsByNote(noteId) {
    return apiRequest(`/api/reactions/note/${noteId}`, {
        method: "GET",
    });
}

export function addReaction(noteId, reactionType) {
    return apiRequest("/api/reactions", {
        method: "POST",
        body: JSON.stringify({ note_id: noteId, reaction_type: reactionType }),
    });
}

export function removeReaction(reactionId) {
    return apiRequest(`/api/reactions/${reactionId}`, {
        method: "DELETE",
    });
}
