/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,css,scss,less}',
    './index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // accent backgrounds
    'bg-blue-600','hover:bg-blue-700','focus:ring-blue-500',
    'bg-indigo-600','hover:bg-indigo-700','focus:ring-indigo-500',
    'bg-green-600','hover:bg-green-700','focus:ring-green-500',
    'bg-purple-600','hover:bg-purple-700','focus:ring-purple-500',
    'bg-teal-600','hover:bg-teal-700','focus:ring-teal-500',
    'bg-amber-600','hover:bg-amber-700','focus:ring-amber-500'
  ]
}
