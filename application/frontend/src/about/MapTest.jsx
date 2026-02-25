import { useEffect } from "react";
import L from "leaflet";

export default function MapTest() {
    useEffect(() => {
        const map = L.map("map").setView([37.7241, -122.4799], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        return () => map.remove();
    }, []);

    return (
        <div id="map" className="h-64 w-full rounded-xl border"></div>
    );
}