import { Link } from "react-router-dom";

import harryImg from "./assets/team-members/harry.png";
import kaitlynImg from "./assets/team-members/kaitlin.jpg";
import rahulImg from "./assets/team-members/rahul.png";
import amulyaImg from "./assets/team-members/amulya.jpg";
import aljhayImg from "./assets/team-members/aljhay.jpg";

import footerBg from "./assets/footer/background.png";
import { useEffect } from "react";

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
            <a href={description} className="text-blue-500 hover:underline">{description}</a>
            <a href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a>
        </div>
    );
}

export default function OurTeam() {
    useEffect(() => {
        document.title = "Our Team | Vibe Check";
    }, []);

    const teamMembers = [
        {
            name: "Harry Kakadiya",
            role: "Team Lead",
            email: "hkakadiya@sfsu.edu",
            image: harryImg,
            description: "https://www.linkedin.com/in/harry-kakadiya-836768295/"
        },
        {
            name: "Kaitlyn Ashby",
            role: "Github Master and Technical Writer",
            email: "kashby@sfsu.edu",
            image: kaitlynImg,
            description: "https://www.linkedin.com/in/kaitlyn-ashby-1250b8208/"
        },
        {
            name: "Rahul Srinath",
            role: "Software Architect",
            email: "rsrinath@sfsu.edu",
            image: rahulImg,
            description: "https://www.linkedin.com/in/rahul-s-a1b328133/"
        },
        {
            name: "Amulya Sagi",
            role: "Backend Lead",
            email: "asagi@sfsu.edu",
            image: amulyaImg,
            description: "https://www.linkedin.com/in/amulya-sagi/"
        },
        {
            name: "Aljhay Soriano",
            role: "Scrum Master",
            email: "asoriano6@sfsu.edu",
            image: aljhayImg,
            description: "https://www.linkedin.com/in/aljhay-soriano-b5982b16b/"
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400">
            <nav className="sticky top-0 z-50 bg-white shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/" className="text-2xl font-black tracking-tight">
                        Vibe Check
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="bg-white text-black py-2 px-3 rounded-lg hover:underline transition cursor-pointer"
                        >
                            Sign In
                        </Link>

                        <Link
                            to="/signup"
                            className="bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 hover:underline transition cursor-pointer shadow-sm"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="flex justify-center p-6 mt-5 mb-5">
                <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl">
                    <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">Meet Our Team</h1>

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
                </div>
            </div>

            <footer className=" relative">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: `url(${footerBg})` }}
                />

                <div className="relative max-w-6xl mx-auto flex justify-between items-center px-6 py-6 text-sm text-gray-700">
                    <span className="text-white font-bold">© ARKHA</span>
                    <Link to="/team" className="text-white font-bold hover:underline">
                        Meet Our Team ❤️
                    </Link>
                </div>
            </footer>
        </div>
    );
}