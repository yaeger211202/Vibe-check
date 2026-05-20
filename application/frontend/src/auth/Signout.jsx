import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signout() {
    const navigate = useNavigate();
    const [msg, setMsg] = useState("Signing out…");

    useEffect(() => {
        fetch("/api/logout", {
            method: "POST",
            credentials: "include",
        })
            .catch(() => {
                // Even if the server call fails, clear everything locally
            })
            .finally(() => {
                // Always wipe localStorage so the next user starts clean
                localStorage.removeItem("user");
                navigate("/signin");
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-gray-400 animate-pulse">{msg}</p>
        </div>
    );
}