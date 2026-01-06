/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./projects/frontend-admin/src/**/*.{html,ts}",
        "./projects/frontend-user/src/**/*.{html,ts}",
        "./projects/shared-lib/src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#dc2626', // Red-600
                'primary-hover': '#b91c1c', // Red-700
                dark: '#0f0f0f', // Very dark grey, almost black
                surface: '#18181b', // Zinc-900
                'surface-highlight': '#27272a', // Zinc-800
                light: '#ffffff',
                grey: {
                    100: '#f4f4f5',
                    300: '#d4d4d8',
                    500: '#71717a',
                    700: '#3f3f46',
                    900: '#18181b',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-out',
                slideUp: 'slideUp 0.6s ease-out forwards',
                'slideUp-delay': 'slideUp 0.6s ease-out 0.2s forwards',
            }
        },
    },
    plugins: [],
}
