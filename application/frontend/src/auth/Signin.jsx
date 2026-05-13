import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/signup/background.png";
import { useI18n } from "../localization/I18nProvider.jsx";

export default function Signin() {
    const navigate = useNavigate();
    const { t, tm } = useI18n();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            navigate("/map");
        }
    }, []);

    useEffect(() => {
        document.title = t("signin.title");
    }, [t]);

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

        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!email || !password) {
            setError(t("signin.validation.missing"));
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || t("signin.validation.failed"));
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/map");
        }
        catch {
            setError(t("signin.validation.connect"));
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 gap-y-8 overflow-x-hidden">
            <section className="hidden lg:flex relative bg-black text-white overflow-hidden">
                <img
                    src={loginImage}
                    alt="Map of San Francisco"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                />

                <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12 xl:p-16">
                    <div>
                        <Link to="/" className="text-2xl font-black tracking-tight">
                            {t("app.brand")}
                        </Link>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                            {t("signin.heroTitle")}
                        </h1>
                        <div className="mt-10 space-y-4">
                            {tm("signin.heroItems").map((item) => (
                                <div
                                    key={item}
                                    className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"
                                >
                                    <p className="text-base text-white">{item}</p>
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
                            {t("app.brand")}
                        </Link>
                        <div className="ml-auto">
                            {t("signin.needAccount")}{" "}
                            <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
                                {t("signin.signUp")}
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">{t("signin.heading")}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("signin.email")}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t("signin.email")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("signin.password")}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t("signin.password")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder:text-sm"
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
                            >
                                {loading ? t("signin.loggingIn") : t("signin.logIn")}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
