import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      nesting: true,
    }),
  ],
  output: "server",
  adapter: vercel(),
});
