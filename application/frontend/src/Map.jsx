import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "./components/Navbar.jsx";

function Sidebar({
                     query,
                     setQuery,
                     results,
                     selectedLocation,
                     onSelectLocation,
                     loading,
                 }) {
    return (
        <div className="flex h-full flex-col">
            <div className="p-4">
                <h2 className="text-lg font-semibold">Search</h2>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Where do you want to go?"
                    className="mt-2 w-full rounded-lg border border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && (
                    <p className="text-sm text-gray-500">Searching...</p>
                )}

                {!loading && query.trim() && results.length > 0 && (
                    <div className="space-y-2">
                        {results.map((place) => (
                            <button
                                key={place.id}
                                onClick={() => onSelectLocation(place)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-left hover:bg-gray-50"
                            >
                                <p className="font-medium text-gray-900">
                                    {place.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {place.type} · {place.category}
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {!loading && query.trim() && results.length === 0 && (
                    <div className="text-sm text-gray-500">
                        <p className="mb-2 font-medium">No results found</p>
                        <p>Try a different search.</p>
                    </div>
                )}

                {!query.trim() && !selectedLocation && (
                    <div className="text-sm text-gray-500">
                        <p className="mb-2 font-medium">No location selected</p>
                        <p>
                            Search for a place or click on the map to view details
                            and current vibes.
                        </p>
                    </div>
                )}

                {selectedLocation && (
                    <div className="rounded-lg border border-gray-300 bg-white p-3 mt-2">
                        <p className="font-medium text-gray-900">
                            {selectedLocation.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            {selectedLocation.type} · {selectedLocation.category}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                            {selectedLocation.lat}, {selectedLocation.lon}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MapView({ selectedLocation }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const map = L.map("vibe-check-map", {
            center: [37.7241, -122.4799],
            zoom: 13,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !selectedLocation) return;

        const lat = Number(selectedLocation.lat);
        const lon = Number(selectedLocation.lon);

        mapRef.current.flyTo([lat, lon], 15);

        if (markerRef.current) {
            markerRef.current.remove();
        }

        markerRef.current = L.marker([lat, lon])
            .addTo(mapRef.current)
            .bindPopup(selectedLocation.name)
            .openPopup();
    }, [selectedLocation]);

    return <div id="vibe-check-map" className="h-full w-full" />;
}

export default function Map() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const isLoggedIn = false;

    return (
        <div className="flex h-screen flex-col">
            <Navbar isLoggedIn={isLoggedIn} />

            <main className="flex flex-1 min-h-0">
                <aside className="flex w-80 flex-col border-r border-gray-200 bg-gradient-to-br from-green-100 to-gray-400">
                    <Sidebar
                        query={query}
                        setQuery={setQuery}
                        results={results}
                        selectedLocation={selectedLocation}
                        onSelectLocation={setSelectedLocation}
                        loading={loading}
                    />
                </aside>

                <div className="flex flex-1 min-h-0">
                    <MapView selectedLocation={selectedLocation} />
                </div>
            </main>
        </div>
    );
}