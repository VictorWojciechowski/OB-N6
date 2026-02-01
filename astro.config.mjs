import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify/server";

export default defineConfig({
  output: "server",
  adapter: netlify(),
});
