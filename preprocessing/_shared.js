import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

export function load(ctx = { filename: "" }) {
  const data = {};
  for (const file of readdirSync("./content")) {
    const key = basename(file, ".json");
    data[key] = JSON.parse(readFileSync(resolve("./content", file), "utf-8"));

    data.article = data.articles.find(
      (a) => basename(a.path ?? "") === basename(ctx.filename),
    );
  }

  return data;
}
