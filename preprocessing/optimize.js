import sharp from "sharp";

import { basename, extname } from "node:path";
import {
  existsSync,
  statSync,
  readdirSync,
  mkdirSync,
  copyFile,
} from "node:fs";

import { ASSET_WIDTH } from "./_defaults.js";

async function convert(path, output, width, height) {
  const res = sharp(path)
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .toFile(`${output}/${basename(path, extname(path))}.webp`, (err, info) => {
      if (err) throw err;
      return info;
    });

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

export function preprocess(assets, output) {
  const paths = images(assets);
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }
  paths.forEach((path) => {
    if (extname(path) === ".png") {
      convert(path, output, ASSET_WIDTH, Math.round(ASSET_WIDTH * (1.3 / 2)));
    } else {
      copyFile(`${path}`, `${output}/${basename(path)}`, (err) => {
        if (err) throw err;
      });
    }
  });
}
