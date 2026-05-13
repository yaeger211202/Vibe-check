import { apiRequest } from "./client.js";

export function getReactionsByNote(noteId) {
    return apiRequest(`/api/reactions/note/${noteId}`, {
        method: "GET",
    });
}

export function addReaction(noteId) {
    return apiRequest("/api/reactions", {
        method: "POST",
        body: JSON.stringify({ note_id: noteId }),
    });
}

export function removeReaction(reactionId) {
    return apiRequest(`/api/reactions/${reactionId}`, {
        method: "DELETE",
    });
}
