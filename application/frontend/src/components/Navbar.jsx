import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../localization/I18nProvider.jsx";

export default function Navbar({ user }) {
    const isLoggedIn = !!user;
    const navigate = useNavigate();
    const { t } = useI18n();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const fetchNotifications = async () => {
        try {
            const response = await fetch("/api/notifications", {
                credentials: "include",
            });

            console.log("notifications status:", response.status);

            const data = await response.json();
            console.log("notifications data:", data);

            if (!response.ok) {
                return;
            }

            setNotifications(data);
        }
        catch (err) {
            console.error("Fetch notifications error:", err);
        }
    };

    const markNotificationRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: "PATCH",
                credentials: "include",
            });

            if (!response.ok) {
                return;
            }

            const updatedNotification = await response.json();

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.notification_id === updatedNotification.notification_id
                        ? updatedNotification
                        : notification
                )
            );
        }
        catch (err) {
            console.error("Mark notification read error:", err);
        }
    };

    const toggleNotifications = async () => {
        if (!showNotifications) {
            await fetchNotifications();
        }

        setShowNotifications((prev) => !prev);
    };

    useEffect(() => {
        if (!isLoggedIn) return;

        fetchNotifications();

        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isLoggedIn]);

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                <Link to="/" className="text-2xl font-black tracking-tight">
                    {t("app.brand")}
                </Link>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={toggleNotifications}
                                    className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition cursor-pointer"
                                    aria-label="Notifications"
                                >
                                    <span className="text-lg">🔔</span>

                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="fixed top-20 right-6 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[10000]">
                                        <div className="px-4 py-3 border-b border-gray-100 font-semibold">
                                            Notifications
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                                    No notifications yet.
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <button
                                                        key={notification.notification_id}
                                                        onClick={() => markNotificationRead(notification.notification_id)}
                                                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                                                            notification.is_read ? "bg-white" : "bg-blue-50"
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-900">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-2">
                                                                    {new Date(notification.created_at).toLocaleString()}
                                                                </p>
                                                            </div>

                                                            {!notification.is_read && (
                                                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                            )}
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

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
                                    window.location.reload();
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