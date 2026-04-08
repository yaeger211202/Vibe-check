import { Routes, Route } from "react-router-dom";
import OurTeam from "./OurTeam.jsx";
import VibeCheckLandingPage from "./LandingPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<VibeCheckLandingPage />} />
            <Route path="/team" element={<OurTeam />} />
        </Routes>
    );
}