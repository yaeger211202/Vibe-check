import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
    const isLoggedIn = !!user;
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                <Link to="/map" className="text-2xl font-black tracking-tight">
                    Vibe Check
                </Link>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" aria-label="Go to profile">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:ring-2 hover:ring-gray-300 transition cursor-pointer">
                                    <span className="text-purple-700 font-semibold text-sm">
                                        {user.username?.[0]?.toUpperCase() || "U"}
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={() => {
                                    localStorage.removeItem("user");
                                    navigate("/");
                                    window.location.reload(); // temp force reload state until sessions implemented
                                }}
                                className="bg-gray-100 text-black py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                            >
                                Sign Out
                            </button>
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