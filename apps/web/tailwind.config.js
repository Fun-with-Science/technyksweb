/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './src/**/*.ts',
    './src/**/*.html',
    './apps/web/src/**/*.{html,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface': '#040810',
        'surface-container-lowest': '#0b0f10',
        'surface-container-low': '#121A2B',
        'surface-container': '#191c1e',
        'surface-container-high': '#272a2c',
        'surface-container-highest': '#323537',
        'surface-bright': '#363a3b',
        'on-surface': '#e0e3e5',
        'on-surface-variant': '#d9c3af',
        'outline': '#a18d7b',
        'outline-variant': '#1E293B',
        'primary': '#ffb867',
        'primary-container': '#E8931A',
        'on-primary': '#040810',
        'secondary': '#378ADD',
        'secondary-container': '#006fc0',
        'on-secondary': '#ffffff',
        'background': '#040810',
        'on-background': '#e0e3e5',
      },
    },
  },
  plugins: [],
};
