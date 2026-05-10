import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import DesktopMapLayout from "./DesktopMapLayout.jsx";
import MobileMapLayout from "./MobileMapLayout.jsx";
import { DEFAULT_CATEGORY, DEFAULT_VIBE_LEVEL } from "./constants.js";

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

    const [locationData, setLocationData] = useState(null);

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
        document.title = "Vibe Check";
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

            const response = await fetch(`/api/search/locations?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                console.error(data.error || "Search failed");
                setResults([]);
                return;
            }

            setResults(data);
        }
        catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
        finally {
            setLoading(false);
        }
    }

    async function handleSelectLocation(place) {
        console.log('handleSelectLocation fired', place);

        try {
            const res = await fetch('/api/locations/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nominatim_id: place.id,
                    name: place.name,
                    lat: place.lat,
                    lng: place.lon,
                })
            });
            const data = await res.json();
            const db_id = data.location.location_id;
            setSelectedLocation({ ...place, db_id });

            const notesRes = await fetch(`/api/notes/location/${db_id}`);
            const notesData = await notesRes.json();
            setLocationData({
                currentVibe: "moderate",
                vibeScorePercent: 58,
                notes: notesData.notes.map(n => ({
                    id: n.note_id,
                    username: n.username,
                    createdAt: n.created_at,
                    expiresAt: n.expires_at,
                    createdAtText: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    vibe: n.vibe_level,
                    text: n.content,
                    reactionCount: parseInt(n.reaction_count),
                    commentCount: parseInt(n.reply_count),
                }))
            });
        } catch (err) {
            console.error('Failed to load location', err);
            setSelectedLocation(place);
        }
        setMobileTab("location");
    }

    function handleCloseLocation() {
        setSelectedLocation(null);
        setMobileTab("map");
    }

    const sharedProps = {
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
        setLocationData,
        user,
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

