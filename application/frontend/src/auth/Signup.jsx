import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImage from "../assets/signup/background.png";
import { useI18n } from "../localization/I18nProvider.jsx";

export default function Signup() {
    const navigate = useNavigate();
    const { t, tm } = useI18n();

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
        document.title = t("signup.title");
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
        setSuccess("");

        const username = formData.username.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!username || !email || !password || !confirmPassword) {
            setError(t("signup.validation.fillAll"));
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError(t("signup.validation.username"));
            return;
        }

        if (password !== confirmPassword) {
            setError(t("signup.validation.passwordMatch"));
            return;
        }

        if (password.length < 8) {
            setError(t("signup.validation.passwordLength"));
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
                setError(data.error || t("signup.validation.failed"));
                return;
            }

            setSuccess(t("signup.validation.success"));
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                navigate("/signin");
            }, 1200);
        }
        catch {
            setError(t("signup.validation.connect"));
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 gap-y-8 overflow-x-hidden">
            <section className="hidden lg:flex relative bg-black text-white overflow-hidden">
                <img
                    src={signupImage}
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
                            {t("signup.heroTitle")}
                        </h1>

                        <div className="mt-10 space-y-4">
                            {tm("signup.heroItems").map((benefit) => (
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
                            {t("app.brand")}
                        </Link>
                        <div className="ml-auto">
                            {t("signup.haveAccount")}{" "}
                            <Link to="/signin" className="font-semibold text-blue-600 hover:underline">
                                {t("signup.signIn")}
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">{t("signup.heading")}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("signup.email")}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t("signup.email")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("signup.username")}
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder={t("signup.username")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("signup.password")}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t("signup.password")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("signup.confirmPassword")}
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={t("signup.confirmPassword")}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder:text-sm"
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
                                className="w-full bg-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed hover:underline cursor-pointer text-base"
                            >
                                {loading ? t("signup.creatingAccount") : t("signup.createAccount")}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
