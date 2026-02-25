import {useEffect, useState} from "react";

export default function DbTest() {
    const [dbStatus, setDbStatus] = useState(null);

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch("/api/database_status");
                if (!res.ok) throw new Error();
                const data = await res.json();
                setDbStatus(data);
            }
            catch {
                setDbStatus({ error: "Database unreachable" });
            }
        }
        checkStatus();
    }, []);

    return (
        <div>
            {dbStatus ? (
                <pre className="text-sm text-gray-700 overflow-x-auto font-mono bg-gray-50 p-4 rounded-lg">
                    {JSON.stringify(dbStatus, null, 2)}
                </pre>
            ) : (<p className="text-gray-700">Checking backend...</p>)}
        </div>

    );
}