import { Routes, Route } from "react-router-dom";
import Landing from "./Landing.jsx";
import Map from "./Map.jsx";
import Signup from "./Signup.jsx";
import OurTeam from "./OurTeam.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/map" element={<Map />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/team" element={<OurTeam />} />
        </Routes>
    );
}