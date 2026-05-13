import { useCallback, useEffect, useRef, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import DesktopMapLayout from "./DesktopMapLayout.jsx";
import MobileMapLayout from "./MobileMapLayout.jsx";
import { DEFAULT_CATEGORY, DEFAULT_VIBE_LEVEL, NOTE_DEFAULT_CATEGORY } from "./constants.js";
import { searchLocations, upsertLocation, getLocationDetails, getLocationVibe } from "../api/locations.js";
import { createNote, deleteNote, getNotesByLocation, updateNote } from "../api/notes.js";

function formatNoteTimestamp(timestamp) {
    if (!timestamp) return "";
    const createdAt = new Date(timestamp).getTime();
    const elapsedMs = Date.now() - createdAt;

    if (Number.isNaN(createdAt) || elapsedMs < 0) return "";

    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (elapsedMs < minuteMs) return "Just now";
    if (elapsedMs < hourMs) return `${Math.floor(elapsedMs / minuteMs)}m ago`;
    if (elapsedMs < dayMs) return `${Math.floor(elapsedMs / hourMs)}h ago`;
    return `${Math.floor(elapsedMs / dayMs)}d ago`;
}

function formatLocationName(location) {
    return location?.name?.trim() || location?.address?.trim() || "Location";
}

function mapApiNote(note, location) {
    return {
        id: note.note_id,
        userId: note.user_id,
        username: note.username,
        locationId: note.location_id ?? location?.db_id ?? null,
        locationName: formatLocationName(location),
        createdAt: note.created_at,
        expiresAt: note.expires_at,
        createdAtText: formatNoteTimestamp(note.created_at),
        vibe: note.vibe_level,
        text: note.content,
        isAnonymous: note.is_anonymous,
        reactionCount: Number.parseInt(note.reaction_count ?? 0, 10),
        commentCount: Number.parseInt(note.reply_count ?? 0, 10),
    };
}

function mapVibeScoreToPercent(score) {
    if (!score) return 0;
    return Math.max(0, Math.min(100, (score / 5) * 100));
}

export default function Map() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [radius, setRadius] = useState(5);
    const [vibeLevel, setVibeLevel] = useState(DEFAULT_VIBE_LEVEL);
    const [category, setCategory] = useState(DEFAULT_CATEGORY);

    const [mobileTab, setMobileTab] = useState("map");
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    const [heatmapData, setHeatmapData] = useState([]);
    const [heatmapLoading, setHeatmapLoading] = useState(false);
    const debounceTimerRef = useRef(null);

    const [locationData, setLocationData] = useState(null);
    const [locationError, setLocationError] = useState("");
    const latestLocationRequestRef = useRef(null);

    const [userLocation, setUserLocation] = useState(null);
    const [userLocationError, setUserLocationError] = useState("");

    const fetchHeatmap = useCallback(async (selectedCategory) => {
        try {
            setHeatmapLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory && selectedCategory !== DEFAULT_CATEGORY) {
                params.set("category", selectedCategory);
            }

            const res = await fetch(`/api/heatmap?${params.toString()}`, {
                cache: "no-store",
            });
            if (!res.ok) {
                console.error("Heatmap fetch failed:", res.status);
                return;
            }
            const data = await res.json();
            console.log("NEW HEATMAP DATA", data);
            setHeatmapData(data);
        } catch (err) {
            console.error("Heatmap fetch error:", err);
        } finally {
            setHeatmapLoading(false);
        }
    }, []);

    // Initial heatmap load
    useEffect(() => {
        fetchHeatmap(category);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-fetch heatmap when category filter changes
    useEffect(() => {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            fetchHeatmap(category);
        }, 400);
        return () => clearTimeout(debounceTimerRef.current);
    }, [category, fetchHeatmap]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        try { setUser(JSON.parse(storedUser)); }
        catch { localStorage.removeItem("user"); }
    }, []);

    useEffect(() => { document.title = "Vibe Check"; }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setUserLocationError("Location services are not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setUserLocationError("");
            },
            (error) => {
                console.error("Location permission error:", error);
                setUserLocationError("Location permission denied or unavailable.");
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }, []);

    useEffect(() => {
        function handleResize() { setIsMobile(window.innerWidth < 768); }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function handleSearch() {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }
        try {
            setLoading(true);
            setHasSearched(true);
            const params = new URLSearchParams({
                q: searchQuery.trim(),
                radius: radius.toString(),
                vibeLevel,
                category: category === DEFAULT_CATEGORY ? "" : category,
            });
            if (userLocation) {
                params.set("lat", userLocation.lat.toString());
                params.set("lon", userLocation.lon.toString());
            }
            const data = await searchLocations(params);
            setLocationError("");
            setResults(data);
        } catch (error) {
            console.error("Search error:", error);
            setLocationError(error.message || "Search failed.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    async function loadLocationData(placeWithDbId) {
        latestLocationRequestRef.current = placeWithDbId.db_id;

        const [notesData, vibeData, locationDetails] = await Promise.all([
            getNotesByLocation(placeWithDbId.db_id),
            getLocationVibe(placeWithDbId.db_id).catch(() => null),
            getLocationDetails(placeWithDbId.db_id).catch(() => null),
        ]);

        const currentVibe = vibeData?.vibe_label?.toLowerCase() || "unknown";
        const vibeScorePercent = mapVibeScoreToPercent(vibeData?.avg_vibe_score);

        const nextLocationData = {
            locationId: placeWithDbId.db_id,
            categoryTags: Array.isArray(locationDetails?.category_tags) && locationDetails.category_tags.length > 0
                ? locationDetails.category_tags
                : [NOTE_DEFAULT_CATEGORY],
            currentVibe,
            vibeScorePercent,
            notes: notesData.notes.map((note) => mapApiNote(note, placeWithDbId)),
        };

        if (latestLocationRequestRef.current !== placeWithDbId.db_id) {
            return nextLocationData;
        }

        setLocationData(nextLocationData);
        return nextLocationData;
    }

    async function handleSelectLocation(place) {
        try {
            setLocationError("");
            const data = await upsertLocation(place);
            const nextLocation = {
                ...place,
                db_id: data.location.location_id,
                categoryTags: Array.isArray(data.location.category_tags) && data.location.category_tags.length > 0
                    ? data.location.category_tags
                    : (place.categoryTags?.length ? place.categoryTags : [NOTE_DEFAULT_CATEGORY]),
            };
            setSelectedLocation(nextLocation);
            await loadLocationData(nextLocation);
        } catch (err) {
            console.error("Failed to load location", err);
            setLocationError(err.message || "Failed to load location.");
            setLocationData(null);
            setSelectedLocation(place);
        }
        setMobileTab("location");
    }

    function handleCloseLocation() {
        latestLocationRequestRef.current = null;
        setSelectedLocation(null);
        setLocationData(null);
        setLocationError("");
        setMobileTab("map");
    }

    async function handleSaveNote(payload) {
        if (!user?.user_id) {
            throw new Error("Sign in to post or edit notes.");
        }

        if (!selectedLocation?.db_id) {
            throw new Error("Select a saved location first.");
        }

        let savedNote;

        if (payload.noteId) {
            const data = await updateNote(payload.noteId, {
                content: payload.text,
                vibe_level: payload.vibe,
                category_tag: payload.category || "na",
            });

            savedNote = mapApiNote({
                ...data.note,
                username: payload.anonymous ? "Anonymous" : user.username,
                reaction_count: 0,
                reply_count: 0,
            }, selectedLocation);

            setLocationData((prev) => ({
                ...prev,
                locationId: selectedLocation.db_id,
                notes: (prev?.notes || []).map((note) =>
                    note.id === payload.noteId
                        ? { ...note, ...savedNote, createdAtText: note.createdAtText }
                        : note
                ),
            }));

            try {
                await loadLocationData(selectedLocation);
                await fetchHeatmap(category);
            } catch (error) {
                console.error("Failed to refresh data after update", error);
            }

            return savedNote;
        }

        if (!userLocation) {
            throw new Error("Location permission is required to post a note.");
        }

        const data = await createNote({
            location_id: selectedLocation.db_id,
            category_tag: payload.category || "na",
            content: payload.text,
            vibe_level: payload.vibe,
            is_anonymous: payload.anonymous,
            user_lat: userLocation.lat,
            user_lon: userLocation.lon,
        });

        savedNote = mapApiNote({
            ...data.note,
            username: payload.anonymous ? "Anonymous" : user.username,
            reaction_count: 0,
            reply_count: 0,
        }, selectedLocation);

        setLocationData((prev) => ({
            ...(prev || {}),
            locationId: selectedLocation.db_id,
            currentVibe: prev?.currentVibe || "unknown",
            vibeScorePercent: prev?.vibeScorePercent || 0,
            notes: [savedNote, ...(prev?.notes || [])],
        }));

        try {
            await loadLocationData(selectedLocation);
            await fetchHeatmap(category);
        } catch (error) {
            console.error("Failed to refresh data after create", error);
        }

        return savedNote;
    }

    async function handleDeleteNote(noteId) {
        if (!user?.user_id) {
            throw new Error("Sign in to delete notes.");
        }

        if (!selectedLocation?.db_id) {
            throw new Error("Select a saved location first.");
        }

        await deleteNote(noteId);

        setLocationData((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                notes: (prev.notes || []).filter((note) => note.id !== noteId),
            };
        });

        try {
            await loadLocationData(selectedLocation);
            await fetchHeatmap(category);
        } catch (error) {
            console.error("Failed to refresh data after delete", error);
        }
    }

    const sharedProps = {
        userLocation,
        userLocationError,
        searchQuery,
        setSearchQuery,
        results,
        selectedLocation,
        handleSelectLocation,
        loading,
        hasSearched,
        radius,
        setRadius,
        vibeLevel,
        setVibeLevel,
        category,
        setCategory,
        heatmapData,
        heatmapLoading,
        handleSearch,
        handleCloseLocation,
        setSelectedLocation,
        mobileTab,
        setMobileTab,
        locationData,
        setLocationData,
        user,
        locationError,
        onSaveNote: handleSaveNote,
        onDeleteNote: handleDeleteNote,
    };

    return (
        <div className="flex h-dvh flex-col">
            <Navbar user={user} />
            {isMobile ? (
                <MobileMapLayout {...sharedProps} />
            ) : (
                <DesktopMapLayout {...sharedProps} />
            )}
        </div>
    );
}