import { useEffect, useRef, useState } from "react";

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

function getLocationIdentity(location) {
    return location?.db_id ?? location?.id ?? null;
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

    const [locationData, setLocationData] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const [mobileTab, setMobileTab] = useState("map");
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    const [locationData, setLocationData] = useState(null);
    const [locationError, setLocationError] = useState("");
    const latestLocationRequestRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [userLocationError, setUserLocationError] = useState("");

    const mockHeatmapData = [
        // SFSU / Stonestown / Parkmerced
        { lat: 37.7241, lon: -122.4799, intensity: 0.95 },
        { lat: 37.7252, lon: -122.4788, intensity: 0.88 },
        { lat: 37.7260, lon: -122.4760, intensity: 0.82 },
        { lat: 37.7235, lon: -122.4815, intensity: 0.78 },
        { lat: 37.7218, lon: -122.4804, intensity: 0.74 },
        { lat: 37.7229, lon: -122.4771, intensity: 0.69 },
        { lat: 37.7209, lon: -122.4787, intensity: 0.63 },
        { lat: 37.7270, lon: -122.4812, intensity: 0.58 },

        // Ingleside / Ocean Ave
        { lat: 37.7230, lon: -122.4585, intensity: 0.62 },
        { lat: 37.7248, lon: -122.4568, intensity: 0.57 },
        { lat: 37.7214, lon: -122.4539, intensity: 0.51 },

        // Sunset
        { lat: 37.7420, lon: -122.4940, intensity: 0.48 },
        { lat: 37.7542, lon: -122.4935, intensity: 0.44 },
        { lat: 37.7658, lon: -122.4912, intensity: 0.46 },

        // Golden Gate Park / Inner Sunset
        { lat: 37.7694, lon: -122.4862, intensity: 0.56 },
        { lat: 37.7668, lon: -122.4718, intensity: 0.61 },
        { lat: 37.7647, lon: -122.4661, intensity: 0.59 },

        // Castro / Noe Valley
        { lat: 37.7609, lon: -122.4350, intensity: 0.67 },
        { lat: 37.7548, lon: -122.4336, intensity: 0.54 },

        // Mission
        { lat: 37.7599, lon: -122.4148, intensity: 0.83 },
        { lat: 37.7571, lon: -122.4193, intensity: 0.79 },
        { lat: 37.7526, lon: -122.4186, intensity: 0.73 },
        { lat: 37.7641, lon: -122.4213, intensity: 0.71 },
        { lat: 37.7652, lon: -122.4108, intensity: 0.66 },

        // Hayes Valley / Civic Center
        { lat: 37.7765, lon: -122.4241, intensity: 0.76 },
        { lat: 37.7786, lon: -122.4179, intensity: 0.72 },
        { lat: 37.7798, lon: -122.4147, intensity: 0.69 },

        // SoMa
        { lat: 37.7812, lon: -122.4058, intensity: 0.87 },
        { lat: 37.7782, lon: -122.4014, intensity: 0.81 },
        { lat: 37.7850, lon: -122.3997, intensity: 0.78 },
        { lat: 37.7819, lon: -122.3969, intensity: 0.72 },

        // Union Square / Downtown
        { lat: 37.7879, lon: -122.4074, intensity: 0.84 },
        { lat: 37.7898, lon: -122.4053, intensity: 0.77 },
        { lat: 37.7912, lon: -122.4039, intensity: 0.71 },

        // Chinatown / North Beach
        { lat: 37.7941, lon: -122.4078, intensity: 0.68 },
        { lat: 37.7983, lon: -122.4075, intensity: 0.64 },
        { lat: 37.8007, lon: -122.4101, intensity: 0.61 },

        // Embarcadero / Ferry Building / Waterfront
        { lat: 37.7955, lon: -122.3937, intensity: 0.86 },
        { lat: 37.7988, lon: -122.3981, intensity: 0.74 },
        { lat: 37.8039, lon: -122.4022, intensity: 0.69 },

        // Marina / Cow Hollow
        { lat: 37.8034, lon: -122.4368, intensity: 0.58 },
        { lat: 37.8009, lon: -122.4387, intensity: 0.52 },

        // Presidio / Richmond
        { lat: 37.7867, lon: -122.4664, intensity: 0.47 },
        { lat: 37.7805, lon: -122.4728, intensity: 0.43 },

        // Potrero / Dogpatch / Mission Bay
        { lat: 37.7578, lon: -122.3996, intensity: 0.63 },
        { lat: 37.7706, lon: -122.3910, intensity: 0.67 },
        { lat: 37.7683, lon: -122.3877, intensity: 0.60 },
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        try {
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem("user");
        }
    }, []);

    useEffect(() => {
        if (!selectedLocation?.id) {
            setLocationData(null);
            return;
        }

        async function fetchLocationData() {
            setLocationLoading(true);
            try {
                const [vibeRes, notesRes] = await Promise.all([
                    fetch(`/api/locations/${selectedLocation.id}/vibe`),
                    fetch(`/api/notes/location/${selectedLocation.id}`),
                ]);

                const vibeData = await vibeRes.json();
                const notesPayload = await notesRes.json();

                const notes = Array.isArray(notesPayload.notes)
                    ? notesPayload.notes.map((n) => ({
                          id: n.note_id,
                          username: n.username || "Anonymous",
                          createdAtText: formatTimeAgo(n.created_at),
                          createdAt: n.created_at,
                          vibe: n.vibe_level,
                          text: n.content,
                          reactionCount: parseInt(n.reaction_count) || 0,
                          commentCount: parseInt(n.reply_count) || 0,
                      }))
                    : [];

                setLocationData({
                    currentVibe: vibeData.vibe_label || "Unknown",
                    notes,
                });
            } catch (err) {
                console.error("Failed to fetch location data:", err);
                setLocationData({ currentVibe: "Unknown", notes: [] });
            } finally {
                setLocationLoading(false);
            }
        }

        fetchLocationData();
    }, [selectedLocation?.id]);

    async function handleSubmitNote(payload) {
        try {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            const userId = storedUser ? JSON.parse(storedUser)?.user_id : null;

            const res = await fetch("/api/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    user_id: userId,
                    location_id: payload.locationId,
                    content: payload.text,
                    vibe_level: payload.vibe,
                    is_anonymous: payload.anonymous,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Note post failed:", err);
                return;
            }

            // Refresh location data after posting
            if (selectedLocation?.id) {
                const [vibeRes, notesRes] = await Promise.all([
                    fetch(`/api/locations/${selectedLocation.id}/vibe`),
                    fetch(`/api/notes/location/${selectedLocation.id}`),
                ]);
                const vibeData = await vibeRes.json();
                const notesPayload = await notesRes.json();
                const notes = Array.isArray(notesPayload.notes)
                    ? notesPayload.notes.map((n) => ({
                          id: n.note_id,
                          username: n.username || "Anonymous",
                          createdAtText: formatTimeAgo(n.created_at),
                          createdAt: n.created_at,
                          vibe: n.vibe_level,
                          text: n.content,
                          reactionCount: parseInt(n.reaction_count) || 0,
                          commentCount: parseInt(n.reply_count) || 0,
                      }))
                    : [];
                setLocationData({ currentVibe: vibeData.vibe_label || "Unknown", notes });
            }
        } catch (err) {
            console.error("Submit note error:", err);
        }
    }

    useEffect(() => {
        document.title = "Vibe Check";
    }, []);

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
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }

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
        }
        catch (error) {
            console.error("Search error:", error);
            setLocationError(error.message || "Search failed.");
            setResults([]);
        }
        finally {
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
                        ? {
                            ...note,
                            ...savedNote,
                            createdAtText: note.createdAtText,
                        }
                        : note
                ),
            }));
            try {
                await loadLocationData(selectedLocation);
            } catch (error) {
                console.error("Failed to refresh location data after update", error);
            }

            return savedNote;
        }

        const data = await createNote({
            location_id: selectedLocation.db_id,
            category_tag: payload.category || "na",
            content: payload.text,
            vibe_level: payload.vibe,
            is_anonymous: payload.anonymous,
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
        } catch (error) {
            console.error("Failed to refresh location data after create", error);
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
        } catch (error) {
            console.error("Failed to refresh location data after delete", error);
        }
    }

    const sharedProps = {
        userLocation,
        userLocationError,
        searchQuery,
        setSearchQuery,
        results,
        selectedLocation,
        loading,
        hasSearched,
        radius,
        setRadius,
        vibeLevel,
        setVibeLevel,
        category,
        setCategory,
        mockHeatmapData,
        handleSearch,
        handleSelectLocation,
        handleCloseLocation,
        setSelectedLocation,
        mobileTab,
        setMobileTab,
        locationData,
<<<<<<< Updated upstream
        setLocationData,
        user,
        locationError,
        onSaveNote: handleSaveNote,
        onDeleteNote: handleDeleteNote,
=======
        locationLoading,
        onSubmitNote: handleSubmitNote,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

function formatTimeAgo(timestamp) {
    if (!timestamp) return "Just now";
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}
>>>>>>> Stashed changes
