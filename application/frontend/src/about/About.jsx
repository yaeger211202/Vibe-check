import MapTest from "./MapTest.jsx";
import DbTest from "./DbTest.jsx";

function TeamCard({ name, role, email }) {
    return (
        <div className="border border-gray-200 bg-gray-100 rounded-xl p-5 h-52 grid grid-rows-3 place-items-center gap-2 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold">{name}</h3>
            <span className="italic">{role}</span>
            <a href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a>
        </div>
    );
}

export default function About() {
    const teamMembers = [
        {name: "Harry Kakadiya", role: "Team Lead", email: "hkakadiya@sfsu.edu",},
        {name: "Kaitlyn Ashby", role: "Github Master and Technical Writer", email: "kashby@sfsu.edu",},
        {name: "Rahul Srinath", role: "Software Architect", email: "rsrinath@sfsu.edu",},
        {name: "Amulya Sagi", role: "Backend Lead", email: "asagi@sfsu.edu",},
        {name: "Aljhay Soriano", role: "Scrum Master", email: "asoriano6@sfsu.edu",},
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400 flex items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl">
                <h1 className="text-4xl font-bold mb-2 text-center tracking-wide">Vibe Check</h1>
                <h2 className="text-gray-600 mb-6 text-center tracking-wide">from Team ARKHA</h2>

                <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(198px,1fr))] gap-6 text-center">
                    {teamMembers.map(({ name, role, email }) => (
                        <TeamCard
                            key={email}
                            name={name}
                            role={role}
                            email={email}
                        />
                    ))}
                </div>

                <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                    <h3 className="font-semibold mb-2 text-center gap-2">System Checks</h3>
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