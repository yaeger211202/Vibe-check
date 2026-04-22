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

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) return;

        try {
            setUser(JSON.parse(storedUser));
        }
        catch {
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
        }
        catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen flex-col">
            <Navbar user={user} />

            <main className="flex flex-1 min-h-0">
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
                                locationData={{
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
                                }}
                                onClose={() => setSelectedLocation(null)}
                                onSubmitNote={(payload) => {
                                    console.log("submit note", payload);
                                }}
                                onReactToNote={(noteId) => {
                                    console.log("react to note", noteId);
                                }}
                                onOpenComments={(noteId) => {
                                    console.log("open comments for note", noteId);
                                }}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}