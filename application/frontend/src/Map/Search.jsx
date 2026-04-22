function SearchFilters({
                           searchQuery,
                           setSearchQuery,
                           radius,
                           setRadius,
                           vibeLevel,
                           setVibeLevel,
                           category,
                           setCategory,
                           onSearch,
                       }) {
    const categories = [
        "All Categories",
        "Restaurant",
        "Libraries",
        "Bar",
        "Cafe",
        "Park",
        "Museum",
        "Shopping",
        "Entertainment",
        "Nightlife",
    ];

    const vibeLevels = [
        { value: "all", label: "All Vibes", color: "bg-black text-white" },
        { value: "dead", label: "Dead", color: "bg-slate-200" },
        { value: "quiet", label: "Quiet", color: "bg-green-400 text-white" },
        { value: "moderate", label: "Moderate", color: "bg-yellow-300 text-black" },
        { value: "busy", label: "Busy", color: "bg-pink-400 text-white" },
        { value: "buzzing", label: "Buzzing", color: "bg-red-500 text-white" },
    ];

    return (
        <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Place Name
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a place..."
                        className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={onSearch}
                        className="shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius: {radius} km
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={radius}
                        onChange={(e) => setRadius(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-sm text-gray-600 font-medium min-w-fit">
                        {radius.toFixed(1)} km
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                </label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vibe Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {vibeLevels.map((vibe) => (
                        <button
                            key={vibe.value}
                            type="button"
                            onClick={() => setVibeLevel(vibe.value)}
                            className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                                vibeLevel === vibe.value
                                    ? `${vibe.color} ring-2 ring-purple-600 text-gray-900`
                                    : `${vibe.color} text-gray-700 hover:shadow-sm`
                            }`}
                        >
                            {vibe.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-lg bg-purple-50 p-3 border border-purple-200">
                <p className="text-xs text-gray-600">
                    <span className="font-semibold">Active Filters:</span> Radius{" "}
                    <span className="font-medium">{radius.toFixed(1)}km</span> •{" "}
                    <span className="font-medium">{category}</span> •{" "}
                    <span className="font-medium capitalize">{vibeLevel}</span>
                </p>
            </div>
        </div>
    );
}

function SearchResults({
                           results,
                           loading,
                           selectedLocation,
                           onSelectLocation,
                           hasSearched,
                       }) {
    return (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Results {results.length > 0 && `(${results.length})`}
            </h3>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-600">Searching...</span>
                </div>
            )}

            {!loading && !hasSearched && (
                <div className="py-6 text-center text-gray-500">
                    <p className="text-sm">
                        Use the filters above to search for places and discover vibes
                    </p>
                </div>
            )}

            {!loading && hasSearched && results.length === 0 && (
                <div className="py-6 text-center text-gray-500">
                    <p className="text-sm">
                        No places found matching your criteria. Try adjusting the filters.
                    </p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-2">
                    {results.map((place) => (
                        <button
                            key={place.id}
                            type="button"
                            onClick={() => onSelectLocation(place)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                selectedLocation?.id === place.id
                                    ? "border-purple-500 bg-purple-50 ring-1 ring-purple-300"
                                    : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {place.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {place.category} • {place.type}
                                    </p>
                                    {place.distance && (
                                        <p className="text-xs text-purple-600 font-medium mt-1">
                                            {place.distance} km away
                                        </p>
                                    )}
                                </div>

                                {place.vibeLevel && (
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                place.vibeLevel === "dead"
                                                    ? "bg-slate-100 text-slate-800"
                                                    : place.vibeLevel === "quiet"
                                                        ? "bg-green-400 text-white"
                                                        : place.vibeLevel === "moderate"
                                                            ? "bg-yellow-300 text-black"
                                                            : place.vibeLevel === "busy"
                                                                ? "bg-pink-400 text-white"
                                                                : place.vibeLevel === "buzzing"
                                                                    ? "bg-red-500 text-white"
                                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {place.vibeLevel}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Search({
                                   searchQuery,
                                   setSearchQuery,
                                   radius,
                                   setRadius,
                                   vibeLevel,
                                   setVibeLevel,
                                   category,
                                   setCategory,
                                   results,
                                   loading,
                                   selectedLocation,
                                   onSelectLocation,
                                   hasSearched,
                                   onSearch,
                               }) {
    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto px-5 py-4">
            <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                radius={radius}
                setRadius={setRadius}
                vibeLevel={vibeLevel}
                setVibeLevel={setVibeLevel}
                category={category}
                setCategory={setCategory}
                onSearch={onSearch}
            />

            <SearchResults
                results={results}
                loading={loading}
                selectedLocation={selectedLocation}
                onSelectLocation={onSelectLocation}
                hasSearched={hasSearched}
            />
        </div>
    );
}