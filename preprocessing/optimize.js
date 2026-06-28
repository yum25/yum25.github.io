import sharp from "sharp";

import { basename, extname } from "node:path";
import {
  existsSync,
  statSync,
  readdirSync,
  mkdirSync,
  copyFile,
} from "node:fs";

const ASSETS_PATH = "./public/assets";
const ASSET_WIDTH = 650;

async function convert(path, width, height) {
  const res = sharp(path)
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .toFile(
      `${ASSETS_PATH}/${basename(path, extname(path))}.webp`,
      (err, info) => {
        if (err) throw err;
        return info;
      },
    );

  return res;
}

function images(dir) {
  var results = [];

  readdirSync(dir).forEach(function (file) {
    file = dir + "/" + file;
    var stat = statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(images(file));
    } else {
      results.push(file);
    }
  });

  return results;
}

function preprocess() {
  const paths = images("./assets");
  if (!existsSync(ASSETS_PATH)) {
    mkdirSync(ASSETS_PATH, { recursive: true });
  }
  paths.forEach((path) => {
    if (extname(path) === ".png") {
      convert(path, ASSET_WIDTH, Math.round(ASSET_WIDTH * (1.3 / 2)));
    } else {
      copyFile(`${path}`, `${ASSETS_PATH}/${basename(path)}`, (err) => {
        if (err) throw err;
      });
    }
  });
}

preprocess();
