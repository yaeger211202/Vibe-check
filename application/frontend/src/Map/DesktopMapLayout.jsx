import Search from "./Search.jsx";
import Heatmap from "./Heatmap.jsx";
import LocationView from "./LocationView.jsx";

export default function DesktopMapLayout({
                                             userLocation,
                                             userLocationError,
                                             searchQuery,
                                             setSearchQuery,
                                             results,
                                             selectedLocation,
                                             handleSelectLocation,
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
                                             handleCloseLocation,
                                             locationData,
                                             setLocationData,
                                             user,
                                             locationError,
                                             onSaveNote,
                                             onDeleteNote,
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
                    setLocationData={setLocationData}
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleSelectLocation}
                    hasSearched={hasSearched}
                    onSearch={handleSearch}
                />
            </aside>

            <div className="flex flex-1 min-h-0">
                <div className="flex-1 min-h-0">
                    <Heatmap
                        selectedLocation={selectedLocation}
                        heatmapData={mockHeatmapData}
                        userLocation={userLocation}
                        userLocationError={userLocationError}
                    />
                </div>

                {selectedLocation && (
                    <div className="w-[54rem] max-w-[65%] min-h-0 border-l border-gray-200 bg-white shadow-xl">
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
        </main>
    );
}
