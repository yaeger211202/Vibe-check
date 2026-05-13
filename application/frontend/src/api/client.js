async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof data === "object" && data !== null && "error" in data
                ? data.error
                : `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data;
}

export async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    return parseResponse(response);
}
