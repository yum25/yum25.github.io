import nunjucks from "nunjucks";
import { resolve } from "path";

import { load } from "./preprocessing/_shared";

function nunjucksPlugin() {
  return {
    name: "nunjucks-plugin",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const data = load(ctx);
        const env = nunjucks.configure(".", { autoescape: true });
        env.addFilter("published", (articles) =>
          articles.filter((article) => article.path),
        );
        env.addFilter("limit", (articles, limit) => articles.slice(0, limit));
        return env.renderString(html, data);
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
      },
    },
  },
};
