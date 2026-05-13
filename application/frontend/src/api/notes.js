import { apiRequest } from "./client.js";

export function getNotesByLocation(locationId) {
    return apiRequest(`/api/notes/location/${locationId}`, {
        method: "GET",
    });
}

export function createNote(payload) {
    return apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateNote(noteId, payload) {
    return apiRequest(`/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function deleteNote(noteId) {
    return apiRequest(`/api/notes/${noteId}`, {
        method: "DELETE",
    });
}
