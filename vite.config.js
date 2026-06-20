import nunjucks from "nunjucks";
import { readFileSync } from "node:fs";

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
  // config options
  plugins: [nunjucksPlugin()],
  base: "/",
};
