import nunjucks from "nunjucks";
import { parse, resolve } from "path";

import { load } from "./preprocessing/_shared";
import articles from "./content/articles.json";

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

const article = Object.assign(
  ...articles
    .filter((entry) => entry.path)
    .map((entry) => parse(entry.path))
    .map(({ name, base }) => ({
      [name]: resolve(__dirname, `blog/${base}`),
    })),
);

export default {
  plugins: [nunjucksPlugin()],
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        blog: resolve(__dirname, "blog/index.html"),
        ...article,
      },
    },
  },
};
