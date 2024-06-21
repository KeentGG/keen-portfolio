/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    perspectiveSize: {
      100: "100px",
      200: "200px",
      500: "400px",
      800: "800px",
      1000: "1000px",
      DEFAULT: "1000px",
    },
    extend: {
      fontFamily: {
        sans: ["Avenir", ...defaultTheme.fontFamily.sans],
        display: ["Caveat", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        "cloud-950": "#111728",
        "cloud-900": "#151C30",
        "cloud-800": "#1A233D",
        "cloud-700": "#28365E",
        "cloud-600": "#314273",
        "cloud-500": "#495F9E",
        "cloud-450": "#6A81C3",
        "cloud-400": "#8A9FDB",
        "cloud-300": "#A7B8E8",
        "cloud-200": "#C4D0F2",
        "cloud-100": "#E1E7FA",
        "cloud-50": "#EDF1FA",
        "rose-800": "#7e4736",
        "rose-600": "#b6644c",
        "rose-500": "#cb7f68",
        "rose-400": "#dc9f8d",
        "rose-300": "#e9c1b5",
      },
      animation: {
        spotlight: "spotlight 2s ease 2s 1 forwards",
        shinyCta: "shinyCta ease 2s 1 forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        shinyCta: {
          "0%": {
            "background-image":
              "radial-gradient(at center top, rgba(0,0,0,80%) -25%, #0E1320 65%)",
          },
          "50%": {
            "background-image":
              "radial-gradient(at center top, rgba(0,0,0,20%) 50%, #0E1320 90%)",
          },
          "100%": {
            "background-image":
              "radial-gradient(at center top, rgba(0,0,0,0%) 100%, #0E1320 120%)",
          },
        },
      },
      smoothShadowSize: {
        lg: "1.4px 1.7px 23.2px -6px rgba(0, 0, 0, 0.035), 3.8px 4.8px 38.2px -6px rgba(0, 0, 0, 0.047), 9px 11.5px 51.6px -6px rgba(0, 0, 0, 0.06), 30px 38px 77px -6px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [
    smoothShadowPlugin,
    perspectivePlugin,
    cardRotatePlugin,
    require("tailwindcss-3d"),
    /* addVariablesForColors */
  ],
};

function cardRotatePlugin({ addUtilities }) {
  addUtilities(
    {
      ".rotate-left": {
        transform:
          "translateX(20px) translateZ(-100px) rotateY(-10deg) scale(0.97)",
      },
      ".rotate-right": {
        transform:
          "translateX(-20px) translateZ(-100px) rotateY(10deg) scale(0.97)",
      },
    },
    { variants: ["responsive"] },
  );
}

function smoothShadowPlugin({ addUtilities, matchUtilities, theme }) {
  const smoothShadowUtilities = {
    ".dark-smooth-shadow-lg": {
      "box-shadow":
        "1.4px 1.7px 23.2px -6px rgba(17, 23, 40, 0.408), 3.8px 4.8px 38.2px -6px rgba(17, 23, 40, 0.483), 9px 11.5px 51.6px -6px rgba(17, 23, 40, 0.561), 30px 38px 77px -6px rgba(17, 23, 40, 0.68)",
    },
  };

  addUtilities(smoothShadowUtilities, {
    variants: ["responsive"], // Add variants if needed
  });

  // // Utilities for shadow colors with arbitrary values
  // matchUtilities(
  //     {
  //         'smooth-shadow': (value) => ({
  //             '--tw-shadow-color': `rgba(${value})`,
  //         }),
  //     },
  //     {
  //         values: { DEFAULT: '0,0,0' }, // Default color
  //         type: 'color',
  //     }
  // )
}

function perspectivePlugin({ matchUtilities, theme }) {
  matchUtilities(
    {
      perspective: (value) => ({
        perspective: value,
      }),
    },
    { values: theme("perspectiveSize") },
  );
}

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
