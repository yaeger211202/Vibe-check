import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import SearchFilterPanel from "./SearchFilterPanel.jsx";
import HeatmapPanel from "./HeatmapPanel.jsx";
import LocationViewPanel from "./LocationViewPanel.jsx";

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
                    <SearchFilterPanel
                        query={query}
                        setQuery={setQuery}
                        results={results}
                        selectedLocation={selectedLocation}
                        onSelectLocation={setSelectedLocation}
                        loading={loading}
                    />
                </aside>

                <div className="relative flex flex-1 min-h-0">
                    <HeatmapPanel selectedLocation={selectedLocation} />

                    {selectedLocation && (
                        <LocationViewPanel selectedLocation={selectedLocation} />
                    )}
                </div>
            </main>
        </div>
    );
}