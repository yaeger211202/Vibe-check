export default function Search({
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
                    <div className="mt-2 rounded-lg border border-gray-300 bg-white p-3">
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