import { useEffect, useState } from "react";

import harryImg from "./assets/team-members/harry.png";
import kaitlynImg from "./assets/team-members/kaitlin.jpg";
import rahulImg from "./assets/team-members/rahul.png";
import amulyaImg from "./assets/team-members/amulya.jpg";
import aljhayImg from "./assets/team-members/aljhay.jpg";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

function TeamMemberCard({ name, role, email, image, description }) {
    return (
        <div className="border border-gray-200 bg-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-3 min-w-0">
            <img
                src={image}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-500"
            />
            <h3 className="font-semibold">{name}</h3>
            <span className="italic text-sm text-gray-500">{role}</span>

            <a
                href={description}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
            >
                View LinkedIn
            </a>

            <a
                href={`mailto:${email}`}
                className="text-blue-500 hover:underline break-all max-w-full"
            >
                {email}
            </a>
        </div>
    );
}

export default function OurTeam() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        document.title = "Our Team | Vibe Check";

        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        try {
            setUser(JSON.parse(storedUser));
        }
        catch {
            localStorage.removeItem("user");
        }
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 to-gray-400">
            <Navbar user={user} />

            <main className="flex-1 flex justify-center p-6 mt-5 mb-5">
                <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl">
                    <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">
                        Meet Our Team
                    </h1>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
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
            </main>

            <Footer />
        </div>
    );
}