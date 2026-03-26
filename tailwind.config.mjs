/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Dark IDE palette — "The Directed Graph"
        'bg-primary':    '#0c0c14',
        'bg-secondary':  '#111119',
        'bg-surface':    '#16161e',
        'bg-terminal':   '#0a0a0a',
        'border':        '#1e1e2e',
        'border-active': '#2a2a3e',
        'text-primary':  '#e8e8f0',
        'text-muted':    '#6b7085',
        // Semantic accent colors
        'node-blue':     '#38bdf8',
        'edge-green':    '#4ade80',
        'rust-orange':   '#f97316',
        'arc-cyan':      '#22d3ee',
        'warn-amber':    '#fbbf24',
        // Legacy aliases — keeps old pages functional until Phase 2-4 redesign
        'void':           '#0c0c14',
        'deep':           '#111119',
        'surface':        '#16161e',
        'muted':          '#6b7085',
        'accent':         '#38bdf8',
        'accent-glow':    '#60ccff',
        'lobster':        '#f97316',
        'lobster-light':  '#fb923c',
        'text-secondary': '#8b8ba8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'draw-edge':  'drawEdge 1.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawEdge: {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
