import { loadFont as loadSans } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

// Geist + Geist Mono — the exact fonts the ArbiFlow app ships (app/layout.tsx).
export const SANS = loadSans().fontFamily;
export const MONO = loadMono().fontFamily;
