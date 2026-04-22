/**
 * Profile.jsx
 *
 * User profile page for Vibe Check.
 *
 * display registration / verification status on profile
 * view own public profile
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";


// MOCK DATA — TODO: replace with API response

// Mock logged-in user object.

const MOCK_USER = {
    // Base User
    user_id: 42,
    username: "kaitlyn_vc",
    email: "kashby@sfsu.edu",
    profile_picture_url: null,    // null triggers the avatar initial fallback
    created_at: "2026-02-15T08:00:00Z",
    account_status: "active",     // active | suspended | deleted
    email_verified: true,

    // User Profile
    visibility: "public",
    default_radius_km: 1.0,
    notifications_enabled: true,
    preferred_categories: ["Study Spot", "Coffee", "Restaurant"],
};


// Main Profile component

/**
 * Profile
 *
 * Displays the logged-in user's account information and verification status.
 *
 * Sections:
 * Profile header  — avatar, username, email, join date
 * Profile details — visibility, radius, preferred categories
 *
 * TODO: Edit username / password 
 */
export default function Profile() {
    const [user] = useState(MOCK_USER);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `${user.username} | Vibe Check`;
        // TODO: if no user in localStorage, navigate("/signin")
    }, [user.username]);

    const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-400">
            <Navbar user={user} />

            <div className="flex justify-center px-4 py-8">
                <div className="w-full max-w-2xl space-y-6">

                    {/* SECTION 1: Profile Header */}
                    <div className="bg-white shadow-2xl rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">

                        {/* Avatar — shows profile_picture_url if set, else first initial */}
                        <div className="shrink-0">
                            {user.profile_picture_url ? (
                                <img
                                    src={user.profile_picture_url}
                                    alt={user.username}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-green-300 shadow"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-green-400 flex items-center justify-center border-4 border-green-300 shadow">
                                    <span className="text-white text-3xl font-black select-none">
                                        {user.username[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-black text-gray-900 mb-1">
                                {user.username}
                            </h1>
                            <p className="text-gray-500 text-sm mb-1">{user.email}</p>
                            <p className="text-gray-400 text-xs">Member since {joinDate}</p>
                        </div>
                    </div>

                    {/* --------------------------------------------------------
                        SECTION 2: Account Status
                        Email verification and account state.
                    -------------------------------------------------------- */}
                    <div className="bg-white shadow-2xl rounded-2xl p-6">
                        <h2 className="text-base font-bold text-gray-800 mb-4">Account Status</h2>

                        <div className="space-y-3">
                            {/* Email verification status */}
                            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Email Verification</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                                {user.email_verified ? (
                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">
                                        ✓ Verified
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-300">
                                        Pending
                                    </span>
                                )}
                            </div>

                            {/* Account state */}
                            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Account State</p>
                                    <p className="text-xs text-gray-400">Current standing of your account</p>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border
                                    ${user.account_status === "active"
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-red-50 text-red-600 border-red-200"}`}>
                                    {user.account_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --------------------------------------------------------
                        SECTION 3: Profile Details
                        Visibility, search radius, preferred categories.
                    -------------------------------------------------------- */}
                    <div className="bg-white shadow-2xl rounded-2xl p-6">
                        <h2 className="text-base font-bold text-gray-800 mb-4">Profile Details</h2>

                        <div className="space-y-3">
                            {/* Profile visibility */}
                            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Visibility</p>
                                    <p className="text-xs text-gray-400">Who can view your profile</p>
                                </div>
                                <span className="text-sm text-gray-600 font-medium capitalize">
                                    {user.visibility.replace("_", " ")}
                                </span>
                            </div>

                            {/* Default search radius */}
                            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Default Search Radius</p>
                                    <p className="text-xs text-gray-400">Used when filtering the map</p>
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                    {user.default_radius_km} km
                                </span>
                            </div>

                            {/* Preferred categories */}
                            <div className="border border-gray-200 rounded-xl px-4 py-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Preferred Categories</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.preferred_categories.map(cat => (
                                        <span
                                            key={cat}
                                            className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
