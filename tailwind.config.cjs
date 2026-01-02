/** @type {import('tailwindcss').Config} */

/**
 * Tailwind Configuration - Minimal Setup
 *
 * All theme configuration (spacing, colors, typography, etc.) has been moved
 * to the @theme block in app/globals.css.
 *
 * This file only contains:
 * - Content paths for Tailwind to scan
 * - Custom plugins
 *
 * The @theme reset directive in globals.css disables all Tailwind defaults,
 * ensuring only Zudo Design System tokens are available.
 */

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './lib/**/*.{js,jsx,ts,tsx,mdx}',
    './*.js',
  ],
  plugins: [],
};
