import { Routes, Route } from "react-router-dom";
import Landing from "./Landing.jsx";
import Map from "./Map/Map.jsx";
import Signin from "./auth/Signin.jsx";
import Signup from "./auth/Signup.jsx";
import Signout from "./auth/Signout.jsx";
import OurTeam from "./OurTeam.jsx";
import Profile from "./Profile.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/map" element={<Map />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signout" element={<Signout />} />
            <Route path="/team" element={<OurTeam />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
    );
}