/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ all your React component files
  ],
  
  theme: {
    extend: {
      colors: {
        // Modern Purple/Indigo Theme
        'primary': {
          DEFAULT: '#8B5CF6', // Purple-500
          light: '#A78BFA',   // Purple-400
          dark: '#7C3AED',    // Purple-600
        },
        'secondary': {
          DEFAULT: '#6366F1', // Indigo-500
          light: '#818CF8',   // Indigo-400
          dark: '#4F46E5',    // Indigo-600
        },
        'accent': {
          DEFAULT: '#EC4899', // Pink-500
          light: '#F472B6',   // Pink-400
          dark: '#DB2777',    // Pink-600
        },
        'dark': {
          DEFAULT: '#1E1B4B', // Indigo-950
          light: '#312E81',   // Indigo-900
          lighter: '#3730A3', // Indigo-800
        }
      },
    },
  },
  plugins: [],
};
