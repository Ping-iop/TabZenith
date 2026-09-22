/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--color-surface-base)',
          subtle: 'var(--color-surface-subtle)',
          card: 'var(--color-surface-card)',
          elevated: 'var(--color-surface-elevated)',
          overlay: 'var(--color-surface-overlay)',
          border: 'var(--color-surface-border)',
          'border-focus': 'var(--color-surface-border-focus)',
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          muted: 'var(--color-content-muted)',
          inverted: 'var(--color-content-inverted)',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          hover: 'var(--color-brand-hover)',
          active: 'var(--color-brand-active)',
          subtle: 'var(--color-brand-subtle)',
          border: 'var(--color-brand-border)',
        },
        status: {
          success: 'var(--color-status-success)',
          'success-subtle': 'var(--color-status-success-subtle)',
          warning: 'var(--color-status-warning)',
          'warning-subtle': 'var(--color-status-warning-subtle)',
          danger: 'var(--color-status-danger)',
          'danger-subtle': 'var(--color-status-danger-subtle)',
          info: 'var(--color-status-info)',
          'info-subtle': 'var(--color-status-info-subtle)',
        },
        chromegroup: {
          grey: 'var(--color-group-grey)',
          blue: 'var(--color-group-blue)',
          red: 'var(--color-group-red)',
          yellow: 'var(--color-group-yellow)',
          green: 'var(--color-group-green)',
          pink: 'var(--color-group-pink)',
          purple: 'var(--color-group-purple)',
          cyan: 'var(--color-group-cyan)',
          orange: 'var(--color-group-orange)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        dropdown: 'var(--shadow-dropdown)',
      },
    },
  },
  plugins: [],
}
