import { Link } from "react-router-dom";

export default function Navbar({ user }) {
    const isLoggedIn = !!user;

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                <Link to="/" className="text-2xl font-black tracking-tight">
                    Vibe Check
                </Link>

                <div className="flex items-center gap-3">
                    {isLoggedIn && (
                        <>
                            <Link
                                to="/search"
                                className="text-gray-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition"
                            >
                                Search
                            </Link>
                            <Link
                                to="/map"
                                className="text-gray-700 py-2 px-4 rounded-lg hover:bg-green-100 transition"
                            >
                                Map
                            </Link>
                        </>
                    )}

                    {isLoggedIn ? (
                        <>
                            <span className="text-sm text-gray-700">
                                Hello, <span>{user.username}</span>!
                            </span>

                            <Link
                                to="/profile"
                                className="bg-gray-100 text-black py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                            >
                                Profile
                            </Link>
                            <Link
                                to="/signout"
                                className="bg-gray-100 text-black py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                            >
                                Sign Out
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/signin"
                                className="bg-white text-black py-2 px-3 rounded-lg hover:underline transition"
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