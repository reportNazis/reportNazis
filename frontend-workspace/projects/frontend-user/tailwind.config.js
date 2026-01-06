/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",                  // Eigene App-Dateien
        "../../projects/shared-lib/src/**/*.{html,ts}" // WICHTIG: Pfad zur Shared Lib
      ],
    theme: {
        extend: {},
    },
    plugins: [],
}
