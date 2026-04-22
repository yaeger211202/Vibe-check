import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function HeatmapPanel({ selectedLocation }) {
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