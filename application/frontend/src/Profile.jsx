/**
 * Profile.jsx
 *
 * User profile page for Vibe Check — fully responsive (mobile-first).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const MOCK_USER_PROFILE = {
    full_name: "John Doe",
    location: "San Francisco, CA",
    profile_picture_url: null,
    created_at: "2024-03-01T08:00:00Z",
    account_status: "active",
    email_verified: true,
    visibility: "public",
    default_radius_km: 1.0,
    notifications_enabled: true,
    friend_notifications_enabled: true,
    preferred_categories: ["Study Spot", "Coffee", "Restaurant"],
    total_notes_posted: 42,
    total_reactions_received: 128,
    total_bookmarks: 7,
};

const VIBE_STYLES = {
    1: { label: "Dead",     style: "bg-gray-100 text-gray-500" },
    2: { label: "Chill",    style: "bg-yellow-100 text-yellow-700" },
    3: { label: "Moderate", style: "bg-blue-100 text-blue-600" },
    4: { label: "Busy",     style: "bg-red-100 text-red-500" },
    5: { label: "Buzzing",  style: "bg-orange-100 text-orange-600" },
};

const MOCK_POSTS = [
    {
        note_id: 1,
        location: "Taqueria El Farolito",
        neighborhood: "Mission, SF",
        distance: "0.3 mi",
        content: "Super packed but worth it. 30 min wait rn.",
        vibe_score: 4,
        created_at: "2h ago",
        reaction_count: 14,
        reply_count: 2,
    },
    {
        note_id: 2,
        location: "Dolores Park",
        neighborhood: "Mission, SF",
        distance: "0.6 mi",
        content: "Perfect afternoon, not too crowded at all.",
        vibe_score: 2,
        created_at: "Just now",
        reaction_count: 8,
        reply_count: 1,
    },
    {
        note_id: 3,
        location: "Blue Bottle Coffee",
        neighborhood: "Hayes Valley",
        distance: "1.1 mi",
        content: "Line out the door, slow service today.",
        vibe_score: 4,
        created_at: "3 hours ago",
        reaction_count: 22,
        reply_count: 4,
    },
    {
        note_id: 4,
        location: "Bi-Rite Creamery",
        neighborhood: "Mission",
        distance: "0.8 mi",
        content: "Short wait, great vibe, go now!",
        vibe_score: 3,
        created_at: "4 hours ago",
        reaction_count: 31,
        reply_count: 6,
    },
    {
        note_id: 5,
        location: "Flour + Water",
        neighborhood: "Mission",
        distance: "0.4 mi",
        content: "Surprisingly quiet tonight — no wait at all.",
        vibe_score: 2,
        created_at: "15 min ago",
        reaction_count: 19,
        reply_count: 3,
    },
    {
        note_id: 6,
        location: "Tartine Bakery",
        neighborhood: "Mission",
        distance: "0.9 mi",
        content: "Crazy packed as usual. Worth it tho.",
        vibe_score: 4,
        created_at: "6 min ago",
        reaction_count: 44,
        reply_count: 8,
    },
];

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

/**
 * PostCard — single note card. Touch-target friendly on mobile.
 */
function PostCard({ note }) {
    const vibe = VIBE_STYLES[note.vibe_score] || VIBE_STYLES[3];

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-3">
            {/* Header: location + time */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{note.location}</p>
                    <p className="text-xs text-gray-400 truncate">{note.neighborhood} · {note.distance}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{note.created_at}</span>
            </div>

            {/* Note content */}
            <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>

            {/* Footer: vibe pill + counts */}
            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${vibe.style}`}>
                    {vibe.label}
                </span>
                <span className="text-xs text-gray-400">
                    👍 {note.reaction_count} · 💬 {note.reply_count}
                </span>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

/**
 * Profile
 *
 * Responsive layout:
 *   mobile  (<sm)  — stacked avatar/info, scrollable tab bar, 1-col post grid
 *   tablet  (sm+)  — side-by-side avatar/info, 2-col post grid
 *   desktop (lg+)  — wider content area, larger avatar
 */
export default function Profile() {
    const [authUser, setAuthUser] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Profile | Vibe Check";
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { navigate("/signin"); return; }
        try {
            setAuthUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem("user");
            navigate("/signin");
        }
    }, []);

    const user = authUser ? { ...MOCK_USER_PROFILE, ...authUser } : null;
    if (!user) return null;

    const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });

    const TABS = [
        { key: "posts",     label: "My Posts" },
        { key: "bookmarks", label: "Bookmarks" },
        { key: "reactions", label: "Reactions" },
        { key: "settings",  label: "Settings" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar user={authUser} />

            {/* ── Page wrapper: comfortable padding at every size ── */}
            <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                {/* ── PROFILE HEADER ────────────────────────────────────────
                    Mobile:  avatar centred above text (column)
                    sm+:     avatar left, text right (row), edit btn top-right
                ──────────────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">

                    {/* Avatar + name block */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">

                        {/* Avatar */}
                        {user.profile_picture_url ? (
                            <img
                                src={user.profile_picture_url}
                                alt={user.username}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                <span className="text-purple-700 text-xl sm:text-2xl font-black select-none">
                                    {(user.full_name || user.username)[0].toUpperCase()}
                                    {(user.full_name || "").split(" ")[1]?.[0]?.toUpperCase() || ""}
                                </span>
                            </div>
                        )}

                        {/* Name + handle + meta — centred on mobile, left-aligned on sm+ */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {user.full_name || user.username}
                            </h1>
                            <p className="text-gray-500 text-sm">@{user.username}</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                                {user.location} · Joined {joinDate}
                            </p>
                        </div>
                    </div>

                    {/* Edit profile button
                        Mobile: full-width below the avatar block
                        sm+:    auto-width pinned top-right */}
                    <button className="w-full sm:w-auto border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                        Edit profile
                    </button>
                </div>

                {/* ── STATS STRIP ───────────────────────────────────────────
                    Always 3 equal columns; just scale font on tiny screens.
                ──────────────────────────────────────────────────────────── */}
                <div className="flex border-t border-b border-gray-200 py-3 sm:py-4 mb-0">
                    {[
                        { value: user.total_notes_posted,       label: "Vibes posted" },
                        { value: user.total_reactions_received, label: "Reactions" },
                        { value: user.total_bookmarks,          label: "Bookmarks" },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`flex-1 text-center ${i < 2 ? "border-r border-gray-200" : ""}`}
                        >
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight px-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── TAB BAR ───────────────────────────────────────────────
                    Horizontally scrollable on mobile so tabs never wrap/clip.
                ──────────────────────────────────────────────────────────── */}
                <div className="flex overflow-x-auto scrollbar-none border-b border-gray-200 -mx-4 sm:mx-0 px-4 sm:px-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition shrink-0
                                ${activeTab === tab.key
                                ? "border-gray-900 text-gray-900"
                                : "border-transparent text-gray-400 hover:text-gray-600"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB CONTENT ───────────────────────────────────────── */}
                <div className="bg-[#b2c8cc] min-h-96 p-4 sm:p-6 rounded-b-xl">

                    {/* MY POSTS: 1-col mobile → 2-col sm+ */}
                    {activeTab === "posts" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {MOCK_POSTS.map(note => (
                                <PostCard key={note.note_id} note={note} />
                            ))}
                        </div>
                    )}

                    {/* BOOKMARKS placeholder */}
                    {activeTab === "bookmarks" && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <p className="text-4xl mb-3">🔖</p>
                            <p className="text-sm text-center">Bookmarks coming in a future milestone.</p>
                        </div>
                    )}

                    {/* REACTIONS placeholder */}
                    {activeTab === "reactions" && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <p className="text-4xl mb-3">👍</p>
                            <p className="text-sm text-center">Reactions coming in a future milestone.</p>
                        </div>
                    )}

                    {/* SETTINGS: max-width card stack, full-width on mobile */}
                    {activeTab === "settings" && (
                        <div className="space-y-4 w-full sm:max-w-xl">

                            {/* Account status card */}
                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Account Status</h2>
                                <div className="space-y-3">

                                    {/* Email verification */}
                                    <div className="flex items-start sm:items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700">Email Verification</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        {user.email_verified ? (
                                            <span className="shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                                                ✓ Verified
                                            </span>
                                        ) : (
                                            <span className="shrink-0 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-200">
                                                Pending
                                            </span>
                                        )}
                                    </div>

                                    {/* Account state */}
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-gray-700">Account State</p>
                                        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border
                                            ${user.account_status === "active"
                                            ? "bg-blue-50 text-blue-600 border-blue-200"
                                            : "bg-red-50 text-red-600 border-red-200"}`}>
                                            {user.account_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile details card */}
                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Profile Details</h2>
                                <div className="space-y-3">

                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-gray-700">Visibility</p>
                                        <span className="text-sm text-gray-600 capitalize">
                                            {user.visibility.replace("_", " ")}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-gray-700">Default Search Radius</p>
                                        <span className="text-sm text-gray-600">
                                            {user.default_radius_km} km
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-700 mb-2">Preferred Categories</p>
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
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}