import Search from "./Search.jsx";
import Heatmap from "./Heatmap.jsx";
import LocationView from "./LocationView.jsx";

export default function MobileMapLayout({
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
                                            mobileTab,
                                            setMobileTab,
                                            locationData,
                                            setLocationData,
                                            user,
                                            locationError,
                                            onSaveNote,
                                            onDeleteNote,
                                        }) {

    return (
        <main className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
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
                        setLocationData={setLocationData}
                        onSelectLocation={handleSelectLocation}
                        hasSearched={hasSearched}
                        onSearch={handleSearch}
                    />
                </div>

                {mobileTab === "map" && (
                    <div className="h-full">
                        <Heatmap
                            selectedLocation={selectedLocation}
                            heatmapData={mockHeatmapData}
                            userLocation={userLocation}
                            userLocationError={userLocationError}
                        />
                    </div>
                )}

                {selectedLocation && (
                    <div className={`h-full bg-white overflow-y-auto ${mobileTab === "location" ? "block" : "hidden"}`}>
                        <LocationView
                            selectedLocation={selectedLocation}
                            locationData={locationData}
                            setLocationData={setLocationData}
                            user={user}
                            errorMessage={locationError}
                            onClose={handleCloseLocation}
                            onSubmitNote={onSaveNote}
                            onDeleteNote={onDeleteNote}
                            onReactToNote={(noteId) => console.log("react to note", noteId)}
                            onOpenComments={(noteId) => console.log("open comments for note", noteId)}
                        />
                    </div>
                )}
            </div>

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
                    Heatmap
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
                        Vibes
                    </button>
                )}
            </nav>
        </main>
    );
}
