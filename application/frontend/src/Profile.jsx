/**
 * Profile.jsx
 *
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const VIBE_STYLES = {
    1: { label: "Dead", style: "bg-gray-100 text-gray-500" },
    2: { label: "Chill", style: "bg-yellow-100 text-yellow-700" },
    3: { label: "Moderate", style: "bg-blue-100 text-blue-600" },
    4: { label: "Busy", style: "bg-red-100 text-red-500" },
    5: { label: "Buzzing", style: "bg-orange-100 text-orange-600" },
    dead: { label: "Dead", style: "bg-gray-100 text-gray-500" },
    quiet: { label: "Chill", style: "bg-yellow-100 text-yellow-700" },
    moderate: { label: "Moderate", style: "bg-blue-100 text-blue-600" },
    busy: { label: "Busy", style: "bg-red-100 text-red-500" },
    buzzing: { label: "Buzzing", style: "bg-orange-100 text-orange-600" },
};

const REACTION_EMOJI = {
    thumbs_up: "👍",
    thumbs_down: "👎",
};

const API = "/api";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function timeAgo(isoString) {
    const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function Banner({ msg, isError }) {
    if (!msg) return null;
    return (
        <p className={`text-sm px-3 py-2 rounded-lg ${isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {msg}
        </p>
    );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function PostCard({ note }) {
    const vibeKey = note.vibe_level || note.vibe_score;
    const vibe = VIBE_STYLES[vibeKey] || VIBE_STYLES[3];

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                        {note.location_name || note.location || `Location #${note.location_id}`}
                    </p>
                    {note.neighborhood && (
                        <p className="text-xs text-gray-400 truncate">{note.neighborhood} · {note.distance}</p>
                    )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                    {note.created_at && !note.created_at.includes("ago") && !note.created_at.includes("now")
                        ? timeAgo(note.created_at)
                        : note.created_at}
                </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
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

/** Card for a note the user has reacted to */
function ReactedNoteCard({ item }) {
    const vibeKey = item.vibe_level;
    const vibe = VIBE_STYLES[vibeKey] || VIBE_STYLES.moderate;
    const emoji = REACTION_EMOJI[item.reaction_type] || "👍";

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                        {item.location_name || `Location #${item.location_id}`}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                        by {item.note_author} · {timeAgo(item.note_created_at)}
                    </p>
                </div>
                {/* badge showing what reaction type the user gave */}
                <span className="shrink-0 text-base" title={item.reaction_type}>
                    {emoji}
                </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${vibe.style}`}>
                    {vibe.label}
                </span>
                <span className="text-xs text-gray-400">
                    👍 {item.reaction_count} · 💬 {item.reply_count}
                </span>
            </div>
        </div>
    );
}

// ─── SETTINGS FORMS ──────────────────────────────────────────────────────────

function UsernameForm({ userId, currentUsername, onSuccess }) {
    const [username, setUsername] = useState(currentUsername || "");
    const [status, setStatus] = useState({ msg: "", isError: false });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setStatus({ msg: "", isError: false });
        try {
            const res = await fetch(`${API}/users/${userId}/username`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus({ msg: data.error, isError: true });
            } else {
                setStatus({ msg: "Username updated!", isError: false });
                onSuccess(data.username);
                const stored = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, username: data.username }));
            }
        } catch {
            setStatus({ msg: "Network error. Please try again.", isError: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">New username</label>
            <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={50}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g. vibemaster99"
            />
            <Banner msg={status.msg} isError={status.isError} />
            <button
                type="submit"
                disabled={loading || !username.trim()}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
            >
                {loading ? "Saving…" : "Save username"}
            </button>
        </form>
    );
}

function PasswordForm({ userId }) {
    const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
    const [status, setStatus] = useState({ msg: "", isError: false });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (form.new_password !== form.confirm) {
            setStatus({ msg: "New passwords do not match.", isError: true });
            return;
        }
        setLoading(true);
        setStatus({ msg: "", isError: false });
        try {
            const res = await fetch(`${API}/users/${userId}/password`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current_password: form.current_password,
                    new_password: form.new_password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus({ msg: data.error, isError: true });
            } else {
                setStatus({ msg: "Password changed successfully.", isError: false });
                setForm({ current_password: "", new_password: "", confirm: "" });
            }
        } catch {
            setStatus({ msg: "Network error. Please try again.", isError: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {[
                { key: "current_password", label: "Current password", placeholder: "Enter current password" },
                { key: "new_password", label: "New password", placeholder: "At least 8 characters" },
                { key: "confirm", label: "Confirm new password", placeholder: "Repeat new password" },
            ].map(({ key, label, placeholder }) => (
                <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                        type="password"
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
            ))}
            <Banner msg={status.msg} isError={status.isError} />
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
            >
                {loading ? "Saving…" : "Change password"}
            </button>
        </form>
    );
}

function PictureForm({ userId, currentUrl, onSuccess }) {
    const [url, setUrl] = useState(currentUrl || "");
    const [status, setStatus] = useState({ msg: "", isError: false });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setStatus({ msg: "", isError: false });
        try {
            const res = await fetch(`${API}/users/${userId}/picture`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_picture_url: url || null }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus({ msg: data.error, isError: true });
            } else {
                setStatus({ msg: "Profile picture updated.", isError: false });
                onSuccess(data.profile_picture_url);
            }
        } catch {
            setStatus({ msg: "Network error. Please try again.", isError: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Profile picture URL</label>
            <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <p className="text-xs text-gray-400">Leave blank to remove your profile picture.</p>
            <Banner msg={status.msg} isError={status.isError} />
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
            >
                {loading ? "Saving…" : "Save picture"}
            </button>
        </form>
    );
}

function VisibilityForm({ userId, currentSettings, onSuccess }) {
    const [visibility, setVisibility] = useState(currentSettings.visibility || "public");
    const [notifications_enabled, setNotificationsEnabled] = useState(currentSettings.notifications_enabled ?? false);
    const [default_radius_km, setDefaultRadius] = useState(currentSettings.default_radius_km || 5.0);
    const [status, setStatus] = useState({ msg: "", isError: false });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setStatus({ msg: "", isError: false });
        try {
            const res = await fetch(`${API}/users/${userId}/settings`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    visibility,
                    notifications_enabled,
                    default_radius_km: parseFloat(default_radius_km),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus({ msg: data.error, isError: true });
            } else {
                setStatus({ msg: "Settings saved.", isError: false });
                onSuccess({ visibility, notifications_enabled, default_radius_km });
            }
        } catch {
            setStatus({ msg: "Network error. Please try again.", isError: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile visibility</label>
                <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                    <option value="public">Public — anyone can view</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                    Friends only visibility coming soon!
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default search radius: <span className="font-bold">{default_radius_km} km</span>
                </label>
                <input
                    type="range"
                    min="0.5" max="25" step="0.5"
                    value={default_radius_km}
                    onChange={e => setDefaultRadius(e.target.value)}
                    className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>0.5 km</span><span>25 km</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Notifications</p>
                <button
                    type="button"
                    onClick={() => setNotificationsEnabled(v => !v)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${notifications_enabled ? "bg-purple-600" : "bg-gray-300"}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-1 ${notifications_enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
            </div>

            <Banner msg={status.msg} isError={status.isError} />
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
            >
                {loading ? "Saving…" : "Save settings"}
            </button>
        </form>
    );
}

function DeleteAccountSection({ userId, onDeleted }) {
    const [open, setOpen] = useState(false);
    const [pw, setPw] = useState("");
    const [status, setStatus] = useState({ msg: "", isError: false });
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!pw) { setStatus({ msg: "Password is required.", isError: true }); return; }
        setLoading(true);
        setStatus({ msg: "", isError: false });
        try {
            const res = await fetch(`${API}/users/${userId}`, {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pw }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus({ msg: data.error, isError: true });
            } else {
                localStorage.removeItem("user");
                onDeleted();
            }
        } catch {
            setStatus({ msg: "Network error. Please try again.", isError: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border border-red-200 rounded-xl p-4 sm:p-5 bg-red-50">
            <h3 className="text-sm font-bold text-red-700 mb-1">Delete account</h3>
            <p className="text-xs text-red-500 mb-3">
                This permanently removes your account. Your anonymous notes will remain but your identity will be detached. This cannot be undone.
            </p>
            {!open ? (
                <button
                    onClick={() => setOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                >
                    Delete my account
                </button>
            ) : (
                <div className="space-y-3">
                    <label className="block text-xs font-medium text-red-700">Confirm your password</label>
                    <input
                        type="password"
                        value={pw}
                        onChange={e => setPw(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <Banner msg={status.msg} isError={status.isError} />
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                        >
                            {loading ? "Deleting…" : "Yes, delete permanently"}
                        </button>
                        <button
                            onClick={() => { setOpen(false); setPw(""); setStatus({ msg: "", isError: false }); }}
                            className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Profile() {
    const { userId: paramUserId } = useParams();
    const [authUser, setAuthUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reactions, setReactions] = useState([]);  // notes this user has reacted to
    const [activeTab, setActiveTab] = useState("posts");
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const navigate = useNavigate();

    // verify JWT session 
    useEffect(() => {
        document.title = "Profile | Vibe Check";

        fetch(`${API}/me`, { credentials: "include" })
            .then(res => {
                if (!res.ok) {
                    if (!paramUserId) navigate("/signin");
                    else setAuthUser(null);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                const sessionUser = data.user;
                const cached = JSON.parse(localStorage.getItem("user") || "{}");
                const merged = { ...cached, ...sessionUser };
                localStorage.setItem("user", JSON.stringify(merged));
                setAuthUser(merged);
            })
            .catch(() => {
                const cached = localStorage.getItem("user");
                if (cached) {
                    try { setAuthUser(JSON.parse(cached)); } catch { /* ignore */ }
                } else if (!paramUserId) {
                    navigate("/signin");
                }
            });
    }, []);

    // load profile, posts, and reactions once session is confirmed
    useEffect(() => {
        const targetId = paramUserId || authUser?.user_id;
        if (!targetId) return;

        setProfile(null);
        setPosts([]);
        setReactions([]);
        setPageError(null);
        setLoading(true);

        const isOwn = !paramUserId || (authUser && parseInt(paramUserId) === authUser.user_id);

        const fetches = [
            fetch(`${API}/users/${targetId}/profile`, { credentials: "include" }),
            fetch(`${API}/notes/user/${targetId}`, { credentials: "include" }),
        ];

        // Only fetch reaction history for own profile 
        if (isOwn && authUser?.user_id) {
            fetches.push(fetch(`${API}/reactions/user/${authUser.user_id}`, { credentials: "include" }));
        }

        Promise.all(fetches)
            .then(async ([profileRes, postsRes, reactionsRes]) => {
                if (!profileRes.ok) {
                    throw new Error(profileRes.status === 404 ? "User not found." : "Could not load profile.");
                }
                const profileData = await profileRes.json();
                const postsData = postsRes.ok ? await postsRes.json() : { notes: [] };
                const reactionsData = reactionsRes?.ok ? await reactionsRes.json() : { reactions: [] };

                setProfile(profileData);

                const ownNotes = (postsData.notes || []).filter(
                    n => String(n.user_id) === String(targetId)
                );
                setPosts(ownNotes);
                setReactions(reactionsData.reactions || []);
            })
            .catch(err => setPageError(err.message))
            .finally(() => setLoading(false));
    }, [authUser, paramUserId]);

    const isOwnProfile = !paramUserId || (authUser && parseInt(paramUserId) === authUser.user_id);

    // ── RENDER STATES ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-gray-400 animate-pulse">Loading profile…</p>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
                <p className="text-red-500 font-medium">{pageError}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 underline">Go back</button>
            </div>
        );
    }

    if (!profile) return null;

    const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });

    const TABS = [
        { key: "posts", label: "My Posts" },
        { key: "bookmarks", label: "Bookmarks" },
        { key: "reactions", label: "Reactions" },
        { key: "settings", label: "Settings" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar user={authUser} />

            <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">

                {/* ── PROFILE HEADER ────────────────────────────────────────
                    Mobile:  avatar centred above text (column)
                    sm+:     avatar left, text right (row), edit btn top-right
                ──────────────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">
                        {profile.profile_picture_url ? (
                            <img
                                src={profile.profile_picture_url}
                                alt={profile.username}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                                <span className="text-purple-700 text-xl sm:text-2xl font-black select-none">
                                    {profile.username?.[0]?.toUpperCase() || "?"}
                                </span>
                            </div>
                        )}

                        <div className="text-center sm:text-left">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {profile.username}
                            </h1>
                            <p className="text-gray-500 text-sm">@{profile.username}</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                                Joined {joinDate}
                            </p>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab("settings")}
                            className="w-full sm:w-auto border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                        >
                            Edit profile
                        </button>
                    )}
                </div>

                {/* ── STATS STRIP ───────────────────────────────────────────
                    Always 3 equal columns; just scale font on tiny screens.
                ──────────────────────────────────────────────────────────── */}
                <div className="flex border-t border-b border-gray-200 py-3 sm:py-4 mb-0">
                    {[
                        { value: profile.total_notes_posted, label: "Vibes posted" },
                        { value: profile.total_reactions_received, label: "Reactions received" },
                        { value: posts.length, label: "Active notes" },
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

                    {/* MY POSTS */}
                    {activeTab === "posts" && (
                        posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <p className="text-4xl mb-3">📝</p>
                                <p className="text-sm text-center">No active notes yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {posts.map(note => (
                                    <PostCard key={note.note_id} note={note} />
                                ))}
                            </div>
                        )
                    )}

                    {/* BOOKMARKS */}
                    {activeTab === "bookmarks" && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <p className="text-4xl mb-3">🔖</p>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Saved locations coming soon</p>
                            <p className="text-xs text-center text-gray-400 max-w-xs">
                                We're working on the ability to bookmark locations. Check back soon!
                            </p>
                        </div>
                    )}

                    {/* REACTIONS */}
                    {activeTab === "reactions" && (
                        !isOwnProfile ? (
                            // Other users' reaction history is private
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <p className="text-4xl mb-3">🔒</p>
                                <p className="text-sm text-center">Reaction history is private.</p>
                            </div>
                        ) : reactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <p className="text-4xl mb-3">👍</p>
                                <p className="text-sm text-center">You haven't reacted to any notes yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {reactions.map(item => (
                                    <ReactedNoteCard key={item.reaction_id} item={item} />
                                ))}
                            </div>
                        )
                    )}

                    {/* SETTINGS */}
                    {activeTab === "settings" && isOwnProfile && (
                        <div className="space-y-4 w-full sm:max-w-xl">

                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Profile Picture</h2>
                                <PictureForm
                                    userId={profile.user_id}
                                    currentUrl={profile.profile_picture_url}
                                    onSuccess={url => setProfile(p => ({ ...p, profile_picture_url: url }))}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Change Username</h2>
                                <UsernameForm
                                    userId={profile.user_id}
                                    currentUsername={profile.username}
                                    onSuccess={name => setProfile(p => ({ ...p, username: name }))}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Change Password</h2>
                                <PasswordForm userId={profile.user_id} />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Account Status</h2>
                                <div className="space-y-3">
                                    <div className="flex items-start sm:items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700">Email Verification</p>
                                            <p className="text-xs text-gray-400 truncate">{authUser?.email || ""}</p>
                                        </div>
                                        {profile.email_verified ? (
                                            <span className="shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                                                ✓ Verified
                                            </span>
                                        ) : (
                                            <span className="shrink-0 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-200">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-gray-700">Account State</p>
                                        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border
                                            ${profile.account_status === "active"
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : "bg-red-50 text-red-600 border-red-200"}`}>
                                            {profile.account_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                                <h2 className="text-sm font-bold text-gray-800 mb-3">Privacy &amp; Preferences</h2>
                                <VisibilityForm
                                    userId={profile.user_id}
                                    currentSettings={{
                                        visibility: profile.visibility,
                                        notifications_enabled: profile.notifications_enabled,
                                        default_radius_km: profile.default_radius_km,
                                    }}
                                    onSuccess={s => setProfile(p => ({ ...p, ...s }))}
                                />
                            </div>

                            <DeleteAccountSection
                                userId={profile.user_id}
                                onDeleted={() => navigate("/signin")}
                            />

                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}