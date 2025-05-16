module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-500': '#4CAF50',
        'green-600': '#45A049',
        'navy-blue-200': '#B3C5E6',
        'navy-blue-300': '#8DA8D9',
        'navy-blue-500': '#1E3A8A',
        'navy-blue-600': '#1A2F6E',
        'navy-blue-700': '#15245A',
        'navy-blue-800': '#101E46',
        'pastel-blue-50': '#E6F0FA',
        primary: '#4CAF50',
        secondary: '#A5D6A7',
        'baby-green-100': '#C8E6C9', // Baby green for sidebar
        'baby-green-200': '#B2DFDB', // Hover effect
      },
    },
  },
  plugins: [],
};