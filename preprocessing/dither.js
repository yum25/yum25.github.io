import sharp from "sharp";

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

function pixel(matrix, brightness, x, y) {
  const cell = matrix[y % matrix.length][x % matrix.length];
  const threshold = (cell + 0.5) / (matrix.length * matrix.length);
  return brightness > threshold ? 1 : 0;
}

function dithered(brightness, width, height, n) {
  const matrix = bayerMatrix(n);
  const out = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bval = brightness[y * width + x];
      out[y * width + x] = pixel(matrix, bval, x, y);
    }
  }

  return out;
}
