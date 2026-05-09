/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb',
                'primary-light': '#e8f0fe',
                dark: '#172023',
                'dark-100': '#1a1a1a',
                'dark-badge': '#111111',
            },
            fontFamily: {
                heading: ['"Radio Canada Big"', 'sans-serif'],
                body: ['"Inter"', 'sans-serif'],
            },
            animation: {
                marquee: 'marquee 20s linear infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
