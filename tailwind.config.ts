import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import themes from "daisyui/src/theming/themes";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...themes.garden,
        },
        dark: {
          ...themes.sunset,
        },
      }
    ],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('@tailwindcss/line-clamp'),
    require("daisyui")
  ],
} satisfies Config;
