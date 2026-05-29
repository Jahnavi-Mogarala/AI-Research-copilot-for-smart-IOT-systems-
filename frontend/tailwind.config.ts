import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        space: ["'Space Grotesk'", "sans-serif"],
        outfit: ["'Outfit'", "sans-serif"]
      },
      colors: {
        luxury: {
          black: "#050202",      // Matte Pitch Black
          dark: "#0b0404",       // Extremely deep matte red-black
          card: "#120707",       // Slightly lighter matte black for cards
          cardHover: "#1b0b0b",  // Card hover state
          border: "#2d0f11",     // Deep wine border
          borderGlow: "#5c1317", // Inner glow wine border
          crimson: "#9e161c",    // Primary Rich Crimson
          burgundy: "#730d11",   // Mid Rich Burgundy
          wine: "#4a0609",       // Deep Wine Red
          cherry: "#2b0305",     // Very dark cherry red
          redGlow: "#ff3e46",    // Accent Premium Neon Red
          gold: "#dca54c",       // Soft Premium Gold
          silver: "#cbd5e1"      // Metallic text/icons
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "luxury-gradient": "linear-gradient(135deg, #0b0404 0%, #120707 50%, #1b0b0b 100%)",
        "glow-gradient": "radial-gradient(circle at center, rgba(158, 22, 28, 0.15) 0%, transparent 70%)"
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "borderGlow 4s linear infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.6" }
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(158, 22, 28, 0.3)", boxShadow: "0 0 5px rgba(158, 22, 28, 0.1)" },
          "50%": { borderColor: "rgba(255, 62, 70, 0.8)", boxShadow: "0 0 15px rgba(255, 62, 70, 0.4)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    },
  },
  plugins: [],
};

export default config;
