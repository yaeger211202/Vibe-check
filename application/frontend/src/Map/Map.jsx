import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Search from "./Search.jsx";
import Heatmap from "./Heatmap.jsx";
import LocationView from "./LocationView.jsx";

export default function Map() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

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

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setResults([]);
            return;
        }

        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `/api/search/locations?q=${encodeURIComponent(trimmedQuery)}`,
                    { signal: controller.signal }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(data.error || "Search failed");
                    setResults([]);
                    return;
                }

                setResults(data);
            }
            catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Search error:", error);
                    setResults([]);
                }
            }
            finally {
                setLoading(false);
            }
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query]);

    return (
        <div className="flex h-screen flex-col">
            <Navbar user={user} />

            <main className="flex flex-1 min-h-0">
                <aside className="flex w-80 flex-col border-r border-gray-200 bg-gradient-to-br from-green-100 to-gray-400">
                    <Search
                        query={query}
                        setQuery={setQuery}
                        results={results}
                        selectedLocation={selectedLocation}
                        onSelectLocation={setSelectedLocation}
                        loading={loading}
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
                                            commentCount: 3,
                                        },
                                        {
                                            id: 2,
                                            username: "@harry",
                                            createdAtText: "1h ago",
                                            distanceText: "0.2 mi away",
                                            vibe: "quiet",
                                            text: "Upstairs is super quiet right now",
                                            reactionCount: 11,
                                            commentCount: 2,
                                        },
                                        {
                                            id: 3,
                                            username: "@rahul",
                                            createdAtText: "1h ago",
                                            distanceText: "0.2 mi away",
                                            vibe: "quiet",
                                            text: "Upstairs is super quiet right now",
                                            reactionCount: 11,
                                            commentCount: 2,
                                        },
                                        {
                                            id: 4,
                                            username: "@aljhay",
                                            createdAtText: "1h ago",
                                            distanceText: "0.2 mi away",
                                            vibe: "quiet",
                                            text: "Upstairs is super quiet right now",
                                            reactionCount: 11,
                                            commentCount: 2,
                                        },
                                        {
                                            id: 5,
                                            username: "@kaitlyn",
                                            createdAtText: "1h ago",
                                            distanceText: "0.2 mi away",
                                            vibe: "quiet",
                                            text: "Upstairs is super quiet right now",
                                            reactionCount: 11,
                                            commentCount: 2,
                                        },
                                        {
                                            id: 6,
                                            username: "@ortiz",
                                            createdAtText: "1h ago",
                                            distanceText: "0.2 mi away",
                                            vibe: "quiet",
                                            text: "Upstairs is super quiet right now",
                                            reactionCount: 11,
                                            commentCount: 2,
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