const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

// Use global cache for token to persist across invocations in development
// In production serverless, this might reset, which is fine (just refetches)
declare global {
    var amadeusCache: {
        token: string | null;
        expiry: number;
    } | undefined;
}

if (!global.amadeusCache) {
    global.amadeusCache = { token: null, expiry: 0 };
}

export async function getAmadeusToken() {
    if (global.amadeusCache!.token && Date.now() < global.amadeusCache!.expiry) {
        return global.amadeusCache!.token;
    }

    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
        throw new Error("Missing Amadeus API Credentials");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", AMADEUS_CLIENT_ID);
    params.append("client_secret", AMADEUS_CLIENT_SECRET);

    try {
        const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Amadeus Auth Error:", errorText);
            throw new Error(`Amadeus Auth Failed: ${res.status}`);
        }

        const data = await res.json();
        global.amadeusCache!.token = data.access_token;
        // expires_in is in seconds. Buffer 60s.
        global.amadeusCache!.expiry = Date.now() + (data.expires_in * 1000) - 60000;

        return data.access_token;
    } catch (error) {
        console.error("Failed to fetch Amadeus token", error);
        throw error;
    }
}
