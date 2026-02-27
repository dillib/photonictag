async function poll() {
    console.log("Polling Railway endpoint...");
    try {
        const res = await fetch("https://photonictag-production.up.railway.app/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@photonictag.com", password: "admin123" })
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

poll();
