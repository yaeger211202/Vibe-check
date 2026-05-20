import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function Heatmap({ selectedLocation, heatmapData = [], userLocation, userLocationError, }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const heatLayerRef = useRef(null);
    const mapContainerRef = useRef(null);
    const userMarkerRef = useRef(null);

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
        if (!mapRef.current) return;

        const points = heatmapData
            .map((point) => {
                const lat = Number(point.lat);
                const lon = Number(point.lon);
                const intensity = Number(point.intensity ?? 0.5);

                if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                    return null;
                }

                return [lat, lon, intensity];
            })
            .filter(Boolean);

        if (heatLayerRef.current) {
            heatLayerRef.current.remove();
            heatLayerRef.current = null;
        }

        if (points.length === 0) return;

        heatLayerRef.current = L.heatLayer(points, {
            radius: 25,
            blur: 18,
            maxZoom: 17,
            minOpacity: 0.25,
        }).addTo(mapRef.current);
    }, [heatmapData]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
                userMarkerRef.current = null;
            }
            return;
        }

        const lat = Number(userLocation.lat);
        const lon = Number(userLocation.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
        }

        userMarkerRef.current = L.circleMarker([lat, lon], {
            radius: 8,
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.9,
            weight: 3,
        })
            .addTo(mapRef.current)
            .bindPopup("Your current location");

        mapRef.current.flyTo([lat, lon], 14);
    }, [userLocation]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!selectedLocation) {
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            return;
        }

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