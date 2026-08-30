// Dynamic API URL: auto-detects localhost vs public HTTPS tunnel
const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const API_BASE_URL = isLocal 
  ? "http://localhost:5001" 
  : "https://hlcqw-2401-4900-5a3b-856-28c0-7cc2-a58-9e29.free.pinggy.net";
