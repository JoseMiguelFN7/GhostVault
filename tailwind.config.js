/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Main background color (Very dark blue)
        'ghost-dark': '#0f172a', 
        
        // Input and card backgrounds (Slightly lighter dark blue)
        'ghost-card': '#1e293b', 
        
        // Main accent color (Violet)
        'ghost-primary': '#8b5cf6',      // Violet-500
        'ghost-primary-hover': '#7c3aed', // Violet-600 (for hovers)
        
        // text colors
        'ghost-text': '#f1f5f9',       // almost white (Slate-100)
        'ghost-muted': '#94a3b8',      // kinda gray (Slate-400)
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    },
    plugins: [],
  }
}
