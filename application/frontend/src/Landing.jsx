import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import Footer from "./components/Footer.jsx";
import { useI18n } from "./localization/I18nProvider.jsx";

export default function Landing() {
    const { t, tm } = useI18n();

    useEffect(() => {
        document.title = t("landing.title");
    }, [t]);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        try {
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400 text-gray-800">
            <section className="min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 md:gap-20 items-center px-6">
                        <div className="flex justify-center md:justify-end">
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-black leading-none">
                                    {t("landing.title")}
                                </h1>
                                <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-md">
                                    {t("landing.tagline")}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            <div className="w-full max-w-sm flex flex-col gap-4">
                                <Link
                                    to="/map"
                                    className="block w-full text-center bg-green-500 text-white font-semibold px-6 py-4 rounded-xl shadow-sm hover:bg-green-600 hover:underline transition text-base"
                                >
                                    {t("landing.cta")}
                                </Link>

                                <div className="flex gap-4">
                                    { !user ? (
                                        <>
                                        <Link
                                            to="/signin"
                                            className="w-1/2 text-center bg-white border border-gray-300 text-black font-semibold px-6 py-4 rounded-xl shadow-sm hover:bg-gray-50 hover:underline transition text-base"
                                        >
                                            Sign In
                                        </Link>

                                        <Link
                                            to="/signup"
                                            className="w-1/2 text-center bg-blue-500 text-white font-semibold px-6 py-4 rounded-xl shadow-sm hover:bg-blue-600 hover:underline transition text-base"
                                        >
                                            Sign Up
                                        </Link>
                                        </>
                                        )
                                         : 
                                        (null)
                                    }
                                        
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
                <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">{t("landing.aboutTitle")}</h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-10">
                        {tm("landing.features").map((f) => (
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
                        <h3 className="font-semibold mb-4 text-center text-lg">{t("landing.howItWorks")}</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            {tm("landing.steps").map((step, i) => (
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
                                <h3 className="font-semibold mb-3 text-lg">{t("landing.withoutTitle")}</h3>
                                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                                    {tm("landing.withoutItems").map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border border-gray-200 bg-gray-100 rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold mb-3 text-lg">{t("landing.withTitle")}</h3>
                                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                                    {tm("landing.withItems").map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
