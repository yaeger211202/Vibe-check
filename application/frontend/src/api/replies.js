import { apiRequest } from "./client.js";

export function getRepliesByNote(noteId) {
    return apiRequest(`/api/replies/note/${noteId}`, {
        method: "GET",
    });
}

export function createReply(payload) {
    return apiRequest("/api/replies", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function deleteReply(replyId) {
    return apiRequest(`/api/replies/${replyId}`, {
        method: "DELETE",
    });
}
