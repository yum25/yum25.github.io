import sharp from "sharp";
import {
  COLOR_SCALE,
  HERO_IMAGE_HEIGHT,
  HERO_IMAGE_WIDTH,
} from "./_defaults.js";
import { basename, extname } from "node:path";

function bayerMatrix(n) {
  if (n === 1) return [[0]];
  const half = bayerMatrix(n / 2);
  const m = Array.from({ length: n }, () => new Array(n));
  for (let y = 0; y < n / 2; y++) {
    for (let x = 0; x < n / 2; x++) {
      const base = half[y][x] * 4;
      m[y][x] = base + 0;
      m[y][x + n / 2] = base + 2;
      m[y + n / 2][x] = base + 3;
      m[y + n / 2][x + n / 2] = base + 1;
    }
  }
  return m;
}

function brightness(image) {
  const { data, width, height, channels } = image;
  const brightness = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    brightness[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  return brightness;
}

async function image(path, width, height) {
  const { data, info } = await sharp(path)
    .resize(width, height, { fit: "fill", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
}

function pixel(matrix, brightness, x, y, levels = 4) {
  const cell = matrix[y % matrix.length][x % matrix.length];
  const offset = (cell + 0.5) / (matrix.length * matrix.length) - 0.5;

  const scaled = brightness * (levels - 1);
  const dithered = scaled + offset;
  const level = Math.max(0, Math.min(levels - 1, Math.round(dithered)));
  return level / (levels - 1);
}

function dithered(brightness, width, height, n, levels = 4) {
  const matrix = bayerMatrix(n);
  const out = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bval = brightness[y * width + x];
      out[y * width + x] = pixel(matrix, bval, x, y, levels);
    }
  }

  return out;
}

async function ditheredWebP(path, dithered, width, height, levels = 4, scale) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const level = Math.round(dithered[i] * (levels - 1));

    const [r, g, b] = scale[level];

    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  }
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, nearLossless: false })
    .toFile(path);
}

export async function preprocess(path, output) {
  const data = await image(path, HERO_IMAGE_WIDTH, HERO_IMAGE_HEIGHT);
  const brightnessArray = brightness(data);
  const res = dithered(brightnessArray, data.width, data.height, 4, 4);

  await ditheredWebP(
    `${output}/${basename(path, extname(path))}.webp`,
    res,
    data.width,
    data.height,
    4,
    COLOR_SCALE,
  );
}
