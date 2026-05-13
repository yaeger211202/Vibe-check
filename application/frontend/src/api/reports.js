// api/reports.js

export async function createReport(targetType, targetId, reason) {
    const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            target_type: targetType,
            target_id:   targetId,
            reason,
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Failed to submit report.");
    }

    return data;
}