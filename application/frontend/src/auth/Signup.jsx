import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImage from "../assets/signup/background.png";

export default function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Sign Up | Vibe Check";
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        const username = formData.username.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!username || !email || !password || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError("Username must contain only letters and numbers.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Sign up failed.");
                return;
            }

            setSuccess("Account created successfully. Redirecting...");
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                navigate("/map");
            }, 1200);
        }
        catch {
            setError("Unable to connect to the server.");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <section className="hidden lg:flex relative bg-black text-white overflow-hidden">
                <img
                    src={signupImage}
                    alt="Map of San Francisco"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                />

                <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12 xl:p-16">
                    <div>
                        <Link to="/" className="text-2xl font-black tracking-tight">
                            Vibe Check
                        </Link>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                            Create your free account
                        </h1>

                        <div className="mt-10 space-y-4">
                            {[
                                "Add live notes about what places feel like right now",
                                "Get notifications for replies, reactions, and updates",
                                "Find the right spot faster without guesswork",
                            ].map((benefit) => (
                                <div
                                    key={benefit}
                                    className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"
                                >
                                    <p className="text-base text-white">{benefit}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div />
                </div>
            </section>

            <section className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400 flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">
                    <div className="mb-6 flex items-center justify-between text-sm text-gray-700">
                        <Link to="/" className="font-black text-2xl tracking-tight lg:hidden text-gray-900">
                            Vibe Check
                        </Link>
                        <div className="ml-auto">
                            Already have an account?{" "}
                            <Link to="/signin" className="font-semibold text-blue-600 hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Sign Up</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Must contain only letters and numbers"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Must be at least 8 characters"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed hover:underline cursor-pointer"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}