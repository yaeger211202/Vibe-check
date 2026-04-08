import { Routes, Route } from "react-router-dom";
import OurTeam from "./OurTeam.jsx";
import VibeCheckLandingPage from "./LandingPage.jsx";
import Signup from "./signup.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<VibeCheckLandingPage />} />
            <Route path="/team" element={<OurTeam />} />
            <Route path="/signup" element={<Signup />} />
        </Routes>
    );
}