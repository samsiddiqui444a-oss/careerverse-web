import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Single configured axios instance for the entire app.
 * All endpoints MUST be prefixed with /api at the call site or here.
 */
export const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// Future: request interceptor for auth token injection.
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("careerverse:token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

export const API_BASE = `${BACKEND_URL}/api`;
