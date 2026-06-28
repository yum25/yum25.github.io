import nunjucks from "nunjucks";
import { readFileSync } from "node:fs";
import { resolve } from "path";

function nunjucksPlugin() {
  return {
    name: "nunjucks-plugin",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const data = JSON.parse(
          readFileSync("./content/projects.json", "utf-8"),
        );

        nunjucks.configure(".", { autoescape: true });
        return nunjucks.renderString(html, data);
      },
    },
  };
}

export default {
  plugins: [nunjucksPlugin()],
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        strands: resolve(__dirname, "blog/strands.html"),
      },
    },
  },
};
