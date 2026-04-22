import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Search from "./Search.jsx";
import Heatmap from "./Heatmap.jsx";
import LocationView from "./LocationView.jsx";

export default function Map() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [radius, setRadius] = useState(5);
    const [vibeLevel, setVibeLevel] = useState("all");
    const [category, setCategory] = useState("All Categories");

    // Mobile tab state: "search" | "map" | "location"
    const [mobileTab, setMobileTab] = useState("map");

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
                category: category === "All Categories" ? "" : category,
            });

            const response = await fetch(`/api/search/locations?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                console.error(data.error || "Search failed");
                setResults([]);
                return;
            }

            setResults(data);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSelectLocation(place) {
        setSelectedLocation(place);
        // On mobile, switch to location tab when a place is selected
        setMobileTab("location");
    }

    function handleCloseLocation() {
        setSelectedLocation(null);
        setMobileTab("map");
    }

    return (
        <div className="flex h-screen flex-col">
            <Navbar user={user} />

            {/* ── Desktop layout (md+) ── */}
            <main className="hidden md:flex flex-1 min-h-0">
                <aside className="w-[420px] flex flex-col border-r border-gray-200 bg-gray-50 min-h-0">
                    <Search
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        radius={radius}
                        setRadius={setRadius}
                        vibeLevel={vibeLevel}
                        setVibeLevel={setVibeLevel}
                        category={category}
                        setCategory={setCategory}
                        results={results}
                        loading={loading}
                        selectedLocation={selectedLocation}
                        onSelectLocation={setSelectedLocation}
                        hasSearched={hasSearched}
                        onSearch={handleSearch}
                    />
                </aside>

                <div className="flex flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                        <Heatmap selectedLocation={selectedLocation} />
                    </div>

                    {selectedLocation && (
                        <div className="w-[54rem] max-w-[65%] min-h-0 border-l border-gray-200 bg-white shadow-xl">
                            <LocationView
                                selectedLocation={selectedLocation}
                                locationData={getMockLocationData()}
                                onClose={() => setSelectedLocation(null)}
                                onSubmitNote={(payload) => console.log("submit note", payload)}
                                onReactToNote={(noteId) => console.log("react to note", noteId)}
                                onOpenComments={(noteId) => console.log("open comments for note", noteId)}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* ── Mobile layout (< md) ── */}
            <main className="flex md:hidden flex-1 flex-col min-h-0">
                {/* Tab panels */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {/* Search panel */}
                    <div className={`h-full bg-gray-50 overflow-y-auto ${mobileTab === "search" ? "block" : "hidden"}`}>
                        <Search
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            radius={radius}
                            setRadius={setRadius}
                            vibeLevel={vibeLevel}
                            setVibeLevel={setVibeLevel}
                            category={category}
                            setCategory={setCategory}
                            results={results}
                            loading={loading}
                            selectedLocation={selectedLocation}
                            onSelectLocation={handleSelectLocation}
                            hasSearched={hasSearched}
                            onSearch={handleSearch}
                        />
                    </div>

                    {/* Map panel */}
                    <div className={`h-full ${mobileTab === "map" ? "block" : "hidden"}`}>
                        <Heatmap selectedLocation={selectedLocation} />
                    </div>

                    {/* Location panel */}
                    {selectedLocation && (
                        <div className={`h-full bg-white overflow-y-auto ${mobileTab === "location" ? "block" : "hidden"}`}>
                            <LocationView
                                selectedLocation={selectedLocation}
                                locationData={getMockLocationData()}
                                onClose={handleCloseLocation}
                                onSubmitNote={(payload) => console.log("submit note", payload)}
                                onReactToNote={(noteId) => console.log("react to note", noteId)}
                                onOpenComments={(noteId) => console.log("open comments for note", noteId)}
                            />
                        </div>
                    )}
                </div>

                {/* Bottom tab bar */}
                <nav className="flex border-t border-gray-200 bg-white shrink-0">
                    <button
                        type="button"
                        onClick={() => setMobileTab("search")}
                        className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                            mobileTab === "search"
                                ? "text-purple-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        Search
                        {results.length > 0 && (
                            <span className="absolute top-1 ml-6 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">
                                {results.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileTab("map")}
                        className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                            mobileTab === "map"
                                ? "text-purple-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0 8V9m0 0L9 7" />
                        </svg>
                        Map
                    </button>

                    {selectedLocation && (
                        <button
                            type="button"
                            onClick={() => setMobileTab("location")}
                            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                                mobileTab === "location"
                                    ? "text-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            </svg>
                            Details
                        </button>
                    )}
                </nav>
            </main>
        </div>
    );
}

// Extracted so both desktop and mobile share the same mock data
function getMockLocationData() {
    return {
        currentVibe: "moderate",
        vibeScorePercent: 58,
        notes: [
            {
                id: 1,
                username: "@amulya",
                createdAtText: "8 min ago",
                distanceText: "0.1 mi away",
                vibe: "busy",
                text: "Every seat is taken. Group study sessions going on everywhere.",
                reactionCount: 8,
                commentCount: 0,
            },
            {
                id: 2,
                username: "@harry",
                createdAtText: "1h ago",
                distanceText: "0.2 mi away",
                vibe: "quiet",
                text: "Upstairs is super quiet right now",
                reactionCount: 0,
                commentCount: 2,
            },
            {
                id: 3,
                username: "@rahul",
                createdAtText: "2h ago",
                distanceText: "0.3 mi away",
                vibe: "moderate",
                text: "Good amount of space available",
                reactionCount: 1,
                commentCount: 4,
            },
            {
                id: 4,
                username: "@aljhay",
                createdAtText: "2h ago",
                distanceText: "0.1 mi away",
                vibe: "busy",
                text: "Some free space, but noisy groups around!",
                reactionCount: 5,
                commentCount: 3,
            },
            {
                id: 5,
                username: "@kaitlyn",
                createdAtText: "3h ago",
                distanceText: "0.2 mi away",
                vibe: "buzzing",
                text: "I wouldn't come here right now if you want some quiet.",
                reactionCount: 7,
                commentCount: 3,
            },
            {
                id: 6,
                username: "@ortiz",
                createdAtText: "1h ago",
                distanceText: "0.2 mi away",
                vibe: "dead",
                text: "Very chill, I'm like the only person here",
                reactionCount: 1,
                commentCount: 0,
            },
        ],
    };
}
