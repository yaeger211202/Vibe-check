import MapTest from "./MapTest.jsx";
import DbTest from "./DbTest.jsx";

import harryImg from "../assets/team-members/default.png";
import kaitlynImg from "../assets/team-members/default.png";
import rahulImg from "../assets/team-members/default.png";
import amulyaImg from "../assets/team-members/default.png";
import aljhayImg from "../assets/team-members/default.png";

function TeamMemberCard({ name, role, email, image, description }) {
    return (
        <div className="border border-gray-200 bg-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-3">
            <img
                src={image}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-500"
            />
            <h3 className="font-semibold">{name}</h3>
            <span className="italic text-sm text-gray-500">{role}</span>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            <a href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a>
        </div>
    );
}

export default function About() {
    const teamMembers = [
        {
            name: "Harry Kakadiya",
            role: "Team Lead",
            email: "hkakadiya@sfsu.edu",
            image: harryImg,
            description: "Person who hits keys on a keyboard."
        },
        {
            name: "Kaitlyn Ashby",
            role: "Github Master and Technical Writer",
            email: "kashby@sfsu.edu",
            image: kaitlynImg,
            description: "Person who hits keys on a keyboard."
        },
        {
            name: "Rahul Srinath",
            role: "Software Architect",
            email: "rsrinath@sfsu.edu",
            image: rahulImg,
            description: "Person who hits keys on a keyboard."
        },
        {
            name: "Amulya Sagi",
            role: "Backend Lead",
            email: "asagi@sfsu.edu",
            image: amulyaImg,
            description: "Person who hits keys on a keyboard."
        },
        {
            name: "Aljhay Soriano",
            role: "Scrum Master",
            email: "asoriano6@sfsu.edu",
            image: aljhayImg,
            description: "Person who hits keys on a keyboard."
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400 flex items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl">
                <h1 className="text-4xl font-bold mb-2 text-center tracking-wide">Vibe Check</h1>
                <h2 className="text-gray-600 mb-6 text-center tracking-wide">from Team ARKHA</h2>

                <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                    {teamMembers.map(({ name, role, email, image, description }) => (
                        <TeamMemberCard
                            key={email}
                            name={name}
                            role={role}
                            email={email}
                            image={image}
                            description={description}
                        />
                    ))}
                </div>

                <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                    <h3 className="font-semibold mb-4 text-center text-lg">System Checks</h3>
                    <div className="flex flex-col mb-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">Database:</h3>
                        <DbTest />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">Leaflet.js + OpenStreetMap:</h3>
                        <MapTest />
                    </div>
                </div>
            </div>
        </div>
    );
}