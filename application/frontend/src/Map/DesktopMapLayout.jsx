import Search from "./Search.jsx";
import Heatmap from "./Heatmap.jsx";
import LocationView from "./LocationView.jsx";

export default function DesktopMapLayout({
    searchQuery, setSearchQuery,
    results, selectedLocation,
    loading, hasSearched,
    radius, setRadius,
    vibeLevel, setVibeLevel,
    category, setCategory,
    heatmapData,        
    heatmapLoading,
    handleSearch,
    setSelectedLocation,
    getMockLocationData,
}) {
    return (
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
                    <Heatmap
                        selectedLocation={selectedLocation}
                        heatmapData={heatmapData}
                        heatmapLoading={heatmapLoading}
                    />
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
    );
}
