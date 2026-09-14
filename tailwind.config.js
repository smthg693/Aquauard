/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          500: '#1B3B6F',
          700: '#0B2545',
          800: '#06172E',
          900: '#030E1E',
        },
        cyan: {
          50: '#E6F8FB',
          100: '#C2EFF5',
          500: '#2EA9C4',
          600: '#248DA4',
          700: '#1A6D80',
        },
        surface: {
          bg: '#F7FAFC',
          card: '#FFFFFF',
          panel: '#F1F5F9',
          border: '#E2E8F0',
          hover: '#EDF2F7',
        },
        agText: {
          primary: '#1A2733',
          secondary: '#4A5568',
          muted: '#718096',
        },
        agStatus: {
          success: '#1F9D63',
          warning: '#DB8A1E',
          danger: '#D6493C',
          info: '#2EA9C4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(11, 37, 69, 0.05)',
        'raised': '0 4px 6px -1px rgba(11, 37, 69, 0.08), 0 2px 4px -1px rgba(11, 37, 69, 0.04)',
        'elevated': '0 10px 15px -3px rgba(11, 37, 69, 0.1), 0 4px 6px -2px rgba(11, 37, 69, 0.05)',
        'modal': '0 20px 25px -5px rgba(11, 37, 69, 0.15), 0 10px 10px -5px rgba(11, 37, 69, 0.08)',
      },
      borderRadius: {
        'ag-sm': '0.375rem',
        'ag-md': '0.5rem',
        'ag-lg': '0.75rem',
        'ag-xl': '1rem',
      }
    },
  },
  plugins: [],
}
