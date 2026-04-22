import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Heatmap({ selectedLocation }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
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
        if (!mapRef.current) return;

        const timeoutId = setTimeout(() => {
            mapRef.current.invalidateSize();
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [selectedLocation]);

    useEffect(() => {
        if (!mapRef.current || !selectedLocation) return;

        const lat = Number(selectedLocation.lat);
        const lon = Number(selectedLocation.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        mapRef.current.flyTo([lat, lon], 15);

        if (markerRef.current) {
            markerRef.current.remove();
        }

        markerRef.current = L.marker([lat, lon])
            .addTo(mapRef.current)
            .bindPopup(selectedLocation.name || selectedLocation.address || "Location")
            .openPopup();
    }, [selectedLocation]);

    return <div ref={mapContainerRef} className="h-full w-full" />;
}