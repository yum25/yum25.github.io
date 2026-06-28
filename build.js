import { existsSync, rmSync } from "node:fs";

import { preprocess as optimize } from "./preprocessing/optimize.js";
import { preprocess as dither } from "./preprocessing/dither.js";
import { ASSETS_PATH, HERO_IMAGE_PATH } from "./preprocessing/_defaults.js";

async function main() {
  if (existsSync(ASSETS_PATH)) {
    rmSync(ASSETS_PATH, { recursive: true });
  }

  // Resize and convert to .webp
  optimize(`./assets/blog`, ASSETS_PATH);
  optimize(`./assets/index`, ASSETS_PATH);

  // Dither hero image and convert to webp
  await dither(HERO_IMAGE_PATH, ASSETS_PATH);
}

await main();
