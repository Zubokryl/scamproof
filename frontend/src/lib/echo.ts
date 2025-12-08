import Echo from "laravel-echo";
import Pusher from "pusher-js";

const echo = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || "key",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
    wsHost: process.env.NEXT_PUBLIC_BACKEND_WS_HOST || "localhost",
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    client: Pusher, // Pass Pusher client directly
    authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem("auth_token") : ""}`
        }
    }
});

export default echo;