import { apiRequest } from "./client.js";

export function searchLocations(params) {
    return apiRequest(`/api/search/locations?${params.toString()}`, {
        method: "GET",
    });
}

export function upsertLocation(place) {
    return apiRequest("/api/locations/upsert", {
        method: "POST",
        body: JSON.stringify({
            nominatim_id: place.id,
            name: place.name,
            lat: place.lat,
            lng: place.lon,
            category_tags: place.categoryTags,
        }),
    });
}

export function getLocationVibe(locationId) {
    return apiRequest(`/api/locations/${locationId}/vibe`, {
        method: "GET",
    });
}

export function getLocationDetails(locationId) {
    return apiRequest(`/api/locations/${locationId}`, {
        method: "GET",
    });
}
