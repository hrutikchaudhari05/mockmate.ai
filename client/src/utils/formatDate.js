export function formatDate(isoString) {
    if (!isoString) return "-";

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

