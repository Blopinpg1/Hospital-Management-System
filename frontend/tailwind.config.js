/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006B58',
          container: '#00A68A',
          foreground: '#FFFFFF',
          fixed: '#ABEBD4',
        },
        surface: {
          DEFAULT: '#F8F9FF',
          low: '#F0F4F8',
          lowest: '#E8EEF4',
          bright: '#FFFFFF',
          highest: '#DCE4EC',
        },
        'on-surface': '#1A2332',
        'on-surface-variant': '#4A5568',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#FFFFFF',
        'on-primary-fixed-variant': '#004D3E',
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
        },
        'on-error': '#FFFFFF',
        'on-error-container': '#410002',
        secondary: {
          DEFAULT: '#4A6741',
          container: '#CCE8C2',
        },
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#102009',
        outline: {
          DEFAULT: '#707870',
          variant: '#C0C8BB',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xs': '0.125rem',
        xs: '0.25rem',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        ambient: '0 8px 24px rgba(26, 35, 50, 0.04)',
        'ambient-md': '0 12px 40px rgba(26, 35, 50, 0.06)',
        'ambient-lg': '0 24px 64px rgba(26, 35, 50, 0.08)',
      },
      spacing: {
        '2.5': '0.625rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
