/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                xiri: {
                    primary: '#0F172A', // Slate 900
                    secondary: '#334155', // Slate 700
                    accent: '#0EA5E9', // Sky 500
                    success: '#10B981', // Emerald 500
                    warning: '#F59E0B', // Amber 500
                    danger: '#EF4444', // Red 500
                    background: '#F8FAFC', // Slate 50
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
