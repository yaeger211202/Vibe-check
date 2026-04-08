import { Link } from "react-router-dom";

export default function Navbar({ isLoggedIn = false }) {
    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                <Link to="/" className="text-2xl font-black tracking-tight">
                    Vibe Check
                </Link>

                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <Link
                            to="/profile"
                            className="bg-gray-100 text-black py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                        >
                            Profile
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-white text-black py-2 px-3 rounded-lg hover:underline transition cursor-pointer"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/signup"
                                className="bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}