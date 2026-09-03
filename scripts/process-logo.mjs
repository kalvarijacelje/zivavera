import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504E47 || buffer.readUInt32BE(4) !== 0x0D0A1A0A) {
    throw new Error('Not a valid PNG file');
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + len);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }

  const compressedData = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressedData);

  let bpp = 0;
  if (colorType === 6) bpp = 4; // RGBA
  else if (colorType === 2) bpp = 3; // RGB
  else if (colorType === 0) bpp = 1; // Grayscale
  else throw new Error(`Unsupported color type: ${colorType}`);

  const rowStride = width * bpp;
  const rawRgba = Buffer.alloc(width * height * 4);
  let srcOffset = 0;

  const prevRow = Buffer.alloc(rowStride);
  const currRow = Buffer.alloc(rowStride);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed.readUInt8(srcOffset++);
    const rowSrc = decompressed.subarray(srcOffset, srcOffset + rowStride);
    srcOffset += rowStride;

    for (let x = 0; x < rowStride; x++) {
      const xVal = rowSrc[x];
      const a = (x >= bpp) ? currRow[x - bpp] : 0;
      const b = prevRow[x];
      const c = (x >= bpp) ? prevRow[x - bpp] : 0;

      let val = 0;
      if (filterType === 0) val = xVal; // None
      else if (filterType === 1) val = (xVal + a) & 0xFF; // Sub
      else if (filterType === 2) val = (xVal + b) & 0xFF; // Up
      else if (filterType === 3) val = (xVal + Math.floor((a + b) / 2)) & 0xFF; // Average
      else if (filterType === 4) val = (xVal + paethPredictor(a, b, c)) & 0xFF; // Paeth

      currRow[x] = val;
    }

    currRow.copy(prevRow);

    // Convert currRow to RGBA buffer
    const destRowOffset = y * width * 4;
    for (let px = 0; px < width; px++) {
      const dIdx = destRowOffset + px * 4;
      const sIdx = px * bpp;
      if (bpp === 4) {
        rawRgba[dIdx] = currRow[sIdx];
        rawRgba[dIdx + 1] = currRow[sIdx + 1];
        rawRgba[dIdx + 2] = currRow[sIdx + 2];
        rawRgba[dIdx + 3] = currRow[sIdx + 3];
      } else if (bpp === 3) {
        rawRgba[dIdx] = currRow[sIdx];
        rawRgba[dIdx + 1] = currRow[sIdx + 1];
        rawRgba[dIdx + 2] = currRow[sIdx + 2];
        rawRgba[dIdx + 3] = 255;
      }
    }
  }

  return { width, height, data: rawRgba };
}

export function encodePng(width, height, rgbaData) {
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Prepare scanlines with filter byte 0 (None)
  const scanlineStride = 1 + width * 4;
  const rawScanlines = Buffer.alloc(height * scanlineStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineStride;
    rawScanlines[rowOffset] = 0; // Filter 0
    rgbaData.copy(rawScanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Flood-fill transparent background starting from outer borders
 */
export function removeOuterWhiteBackground(img) {
  const { width, height, data } = img;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isWhite(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Outer white/near-white border threshold
    return (r >= 240 && g >= 240 && b >= 240);
  }

  // Push all border pixels to queue
  for (let x = 0; x < width; x++) {
    if (isWhite(x, 0)) { queue.push((0 * width + x)); visited[0 * width + x] = 1; }
    if (isWhite(x, height - 1)) { queue.push(((height - 1) * width + x)); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isWhite(0, y)) { queue.push((y * width + 0)); visited[y * width + 0] = 1; }
    if (isWhite(width - 1, y)) { queue.push((y * width + (width - 1))); visited[y * width + (width - 1)] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const pIdx = queue[head++];
    const x = pIdx % width;
    const y = Math.floor(pIdx / width);

    // Make pixel fully transparent
    const dIdx = pIdx * 4;
    data[dIdx + 3] = 0; // Alpha 0

    // Check 4 neighbors
    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isWhite(nx, ny)) {
          visited[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }
  }

  return img;
}

/**
 * Crop to non-transparent bounding box with padding
 */
export function cropToContent(img, paddingPercent = 0.04) {
  const { width, height, data } = img;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return img;
  }

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const pad = Math.round(Math.max(contentW, contentH) * paddingPercent);

  // Target square size
  const maxDim = Math.max(contentW, contentH) + pad * 2;
  const outW = maxDim;
  const outH = maxDim;
  const outData = Buffer.alloc(outW * outH * 4);

  const startX = pad + Math.floor((maxDim - pad * 2 - contentW) / 2);
  const startY = pad + Math.floor((maxDim - pad * 2 - contentH) / 2);

  for (let y = 0; y < contentH; y++) {
    for (let x = 0; x < contentW; x++) {
      const srcIdx = ((minY + y) * width + (minX + x)) * 4;
      const dstIdx = ((startY + y) * outW + (startX + x)) * 4;
      outData[dstIdx] = data[srcIdx];
      outData[dstIdx + 1] = data[srcIdx + 1];
      outData[dstIdx + 2] = data[srcIdx + 2];
      outData[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return { width: outW, height: outH, data: outData };
}

/**
 * High-quality bilinear resize
 */
export function resizeImage(img, targetW, targetH) {
  const { width, height, data } = img;
  const outData = Buffer.alloc(targetW * targetH * 4);

  const xRatio = width / targetW;
  const yRatio = height / targetH;

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const gx = x * xRatio;
      const gy = y * yRatio;
      const gxi = Math.floor(gx);
      const gyi = Math.floor(gy);
      const xDiff = gx - gxi;
      const yDiff = gy - gyi;

      const gxiNext = Math.min(gxi + 1, width - 1);
      const gyiNext = Math.min(gyi + 1, height - 1);

      const i00 = (gyi * width + gxi) * 4;
      const i10 = (gyi * width + gxiNext) * 4;
      const i01 = (gyiNext * width + gxi) * 4;
      const i11 = (gyiNext * width + gxiNext) * 4;

      const dstIdx = (y * targetW + x) * 4;

      for (let c = 0; c < 4; c++) {
        const val =
          data[i00 + c] * (1 - xDiff) * (1 - yDiff) +
          data[i10 + c] * xDiff * (1 - yDiff) +
          data[i01 + c] * (1 - xDiff) * yDiff +
          data[i11 + c] * xDiff * yDiff;

        outData[dstIdx + c] = Math.round(val);
      }
    }
  }

  return { width: targetW, height: targetH, data: outData };
}

/**
 * Main processing routine
 */
export function processAllLogos() {
  const sourcePath = path.join(rootDir, 'public', 'zivavera-logo-bel.png');
  if (!fs.existsSync(sourcePath)) {
    console.warn('[Logo Process] Source file public/zivavera-logo-bel.png not found!');
    return;
  }

  console.log('[Logo Process] Reading master file:', sourcePath);
  const srcBuf = fs.readFileSync(sourcePath);
  const rawImg = decodePng(srcBuf);
  console.log(`[Logo Process] Decoded ${rawImg.width}x${rawImg.height}`);

  // 1. Flood fill outer white border to transparent
  const transparentImg = removeOuterWhiteBackground(rawImg);

  // 2. Crop to square bounding box
  const cropped = cropToContent(transparentImg, 0.03);

  // 3. Generate 512x512 master high-res transparent PNG
  const img512 = resizeImage(cropped, 512, 512);
  const png512 = encodePng(512, 512, img512.data);
  fs.writeFileSync(path.join(rootDir, 'public', 'logo.png'), png512);
  fs.writeFileSync(path.join(rootDir, 'public', 'icon-512.png'), png512);
  fs.writeFileSync(path.join(rootDir, 'public', 'apple-touch-icon.png'), png512);
  console.log(`[Logo Process] Written public/logo.png & icon-512.png (${(png512.length / 1024).toFixed(1)} KB)`);

  // 4. Generate 192x192 mobile PWA icon
  const img192 = resizeImage(cropped, 192, 192);
  const png192 = encodePng(192, 192, img192.data);
  fs.writeFileSync(path.join(rootDir, 'public', 'icon-192.png'), png192);
  console.log(`[Logo Process] Written public/icon-192.png (${(png192.length / 1024).toFixed(1)} KB)`);

  // 5. Generate maskable icon for Android (with warm dark espresso background and safe-zone inset)
  const maskableImg = {
    width: 512,
    height: 512,
    data: Buffer.alloc(512 * 512 * 4)
  };
  // Fill background #24140e (R:36, G:20, B:14, A:255)
  for (let i = 0; i < 512 * 512; i++) {
    maskableImg.data[i * 4] = 36;
    maskableImg.data[i * 4 + 1] = 20;
    maskableImg.data[i * 4 + 2] = 14;
    maskableImg.data[i * 4 + 3] = 255;
  }
  // Inset the cropped logo to 78% (scale down to 400x400 and center at offset 56, 56)
  const insetLogo = resizeImage(cropped, 400, 400);
  for (let y = 0; y < 400; y++) {
    for (let x = 0; x < 400; x++) {
      const srcIdx = (y * 400 + x) * 4;
      const alpha = insetLogo.data[srcIdx + 3] / 255;
      if (alpha > 0) {
        const dstIdx = ((56 + y) * 512 + (56 + x)) * 4;
        maskableImg.data[dstIdx] = Math.round(insetLogo.data[srcIdx] * alpha + maskableImg.data[dstIdx] * (1 - alpha));
        maskableImg.data[dstIdx + 1] = Math.round(insetLogo.data[srcIdx + 1] * alpha + maskableImg.data[dstIdx + 1] * (1 - alpha));
        maskableImg.data[dstIdx + 2] = Math.round(insetLogo.data[srcIdx + 2] * alpha + maskableImg.data[dstIdx + 2] * (1 - alpha));
        maskableImg.data[dstIdx + 3] = 255;
      }
    }
  }
  const maskablePng = encodePng(512, 512, maskableImg.data);
  fs.writeFileSync(path.join(rootDir, 'public', 'icon-maskable.png'), maskablePng);
  console.log(`[Logo Process] Written public/icon-maskable.png (${(maskablePng.length / 1024).toFixed(1)} KB)`);

  // 6. Copy to src/assets for bundler imports
  const assetsDir = path.join(rootDir, 'src', 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.writeFileSync(path.join(assetsDir, 'logo-light.jpg'), png512);
    fs.writeFileSync(path.join(assetsDir, 'logo-dark.jpg'), png512);
  }

  console.log('[Logo Process] Completed successfully! All assets generated from public/zivavera-logo-bel.png');
}

// Run if called directly
processAllLogos();
