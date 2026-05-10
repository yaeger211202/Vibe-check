import Search from "./Search.jsx";
import Heatmap from "./Heatmap.jsx";
import LocationView from "./LocationView.jsx";

export default function DesktopMapLayout({
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
                                             setSelectedLocation,
                                             locationData,
                                             setLocationData,  
                                             user,
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
                    />
                </div>

                {selectedLocation && (
                    <div className="w-[54rem] max-w-[65%] min-h-0 border-l border-gray-200 bg-white shadow-xl">
                        <LocationView
                            selectedLocation={selectedLocation}
                            locationData={locationData}
                            onClose={() => setSelectedLocation(null)}
                            onSubmitNote={async (payload) => {
                                if (!selectedLocation?.db_id) {
                                    console.error('No db_id on selected location');
                                    return;
                                }

                                try {
                                    const res = await fetch('/api/notes', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            user_id: user?.user_id ?? 1,
                                            location_id: selectedLocation.db_id,
                                            content: payload.text,
                                            vibe_level: payload.vibe,
                                            is_anonymous: payload.anonymous
                                        })
                                    });

                                    const data = await res.json();
                                    console.log('Note creation response:', data);

                                    if (!res.ok) {
                                        console.error('Failed to create note:', data.error);
                                        return;
                                    }

                                    if (data.note) {
                                        setLocationData(prev => ({
                                            ...prev,
                                            notes: [{
                                                id: data.note.note_id,
                                                username: user?.username ?? 'Anonymous',
                                                createdAt: data.note.created_at,
                                                createdAtText: 'Just now',
                                                vibe: data.note.vibe_level,
                                                text: data.note.content,
                                                reactionCount: 0,
                                                commentCount: 0,
                                            }, ...prev.notes]
                                        }));
                                    }
                                } catch (err) {
                                    console.error('Failed to submit note:', err);
                                }
                            }}
                            onReactToNote={(noteId) => console.log("react to note", noteId)}
                            onOpenComments={(noteId) => console.log("open comments for note", noteId)}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}