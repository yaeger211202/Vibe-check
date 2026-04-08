import { Link } from "react-router-dom";
import footerBg from "./assets/footer/background.png";
import {useEffect} from "react";

export default function VibeCheckLandingPage() {
    useEffect(() => {
        document.title = "Vibe Check";
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400 text-gray-800">
            <section className="min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 md:gap-20 items-center">
                        <div className="flex justify-center md:justify-end">
                            <div className="text-center md:text-left">
                                <h1 className="text-6xl md:text-8xl font-black tracking-tight text-black leading-none">
                                    Vibe Check
                                </h1>
                                <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-md">
                                    Real-time, location-based bulletin board.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            <div className="w-full max-w-sm flex flex-col gap-4">
                                <Link
                                    to="/app"
                                    className="block text-center bg-green-500 text-white font-semibold px-6 py-4 rounded-xl shadow-sm hover:bg-green-600 hover:underline transition"
                                >
                                    Let's Go!
                                </Link>

                                <div className="flex gap-4">
                                    <Link
                                        to="/login"
                                        className="w-1/2 text-center bg-white border border-gray-300 text-black font-semibold px-6 py-4 rounded-xl shadow-sm hover:bg-gray-50 hover:underline transition"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        to="/signup"
                                        className="w-1/2 text-center bg-blue-500 text-white font-semibold px-6 py-4 rounded-xl shadow-sm hover:bg-blue-600 hover:underline transition"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pb-10 flex justify-center">
                    <a href="#more-info" className="flex flex-col items-center text-gray-600 hover:text-gray-900 transition">
                        <span className="text-3xl leading-none animate-bounce">↓</span>
                    </a>
                </div>
            </section>

            <section id="more-info" className="px-6 pb-12">
                <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">What Is Vibe Check?</h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-10">
                        {[
                            {
                                title: "Live Vibes",
                                text: "See what a place feels like right now, not what it felt like weeks ago.",
                            },
                            {
                                title: "Location-Locked Posts",
                                text: "Only nearby users contribute, keeping updates more relevant and grounded.",
                            },
                            {
                                title: "Expiring Notes",
                                text: "Posts disappear so everything stays current and relevant.",
                            },
                            {
                                title: "Live Heatmap",
                                text: "Quickly spot busy and quiet areas with real-time activity data.",
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="border border-gray-200 bg-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                            >
                                <h3 className="font-semibold mb-2">{f.title}</h3>
                                <p className="text-gray-600 text-sm">{f.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold mb-4 text-center text-lg">How It Works</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            {[
                                "Search or explore nearby places",
                                "Check live notes and vibe levels",
                                "Choose where to go with confidence",
                            ].map((step, i) => (
                                <div key={i} className="p-4">
                                    <div className="font-bold text-lg mb-2">{i + 1}</div>
                                    <p className="text-gray-600">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 bg-gray-100 rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-3 text-lg">Without Vibe Check</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Reviews are often outdated</li>
                                    <li>• Busy-time estimates rely on historical trends</li>
                                    <li>• You can arrive somewhere overcrowded, noisy, or closed</li>
                                    <li>• Time and effort get wasted on bad choices</li>
                                </ul>
                            </div>

                            <div className="border border-gray-200 bg-gray-100 rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-3 text-lg">With Vibe Check</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Live, crowd-sourced updates from nearby users</li>
                                    <li>• Real-time vibe levels for places around you</li>
                                    <li>• Fast decisions based on what is happening now</li>
                                    <li>• Less guesswork, less frustration</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <footer className="mt-12 relative">
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