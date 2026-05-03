/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'brand-primary':       '#6366F1',
        'brand-secondary':     '#818CF8',
        'brand-accent':        '#EC4899',
        'brand-text':          '#334155',
        'brand-text-light':    '#64748b',
        'brand-primary-light': '#C7D2FE',
        'brand-background':    '#F9FAFB',
        'brand-surface':       '#FFFFFF',
        'brand-danger':        '#EF4444',
        'brand-warning':       '#F59E0B',
        'brand-success':       '#10B981',
      },
    },
  },
  plugins: [],
};
