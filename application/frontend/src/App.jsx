import { Routes, Route } from "react-router-dom";
import About from "./about/About.jsx";
import VibeCheckLandingPage from "./landing_page/LandingPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<VibeCheckLandingPage />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
}