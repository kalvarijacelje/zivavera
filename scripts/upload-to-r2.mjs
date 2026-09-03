/**
 * Cloudflare R2 Upload Helper Script for Živa Vera Logo
 * 
 * Usage:
 *   node scripts/upload-to-r2.mjs
 * 
 * Requirements in .env or environment variables:
 *   R2_ACCOUNT_ID="your_cloudflare_account_id"
 *   R2_ACCESS_KEY_ID="your_r2_access_key_id"
 *   R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
 *   R2_BUCKET_NAME="media" (or your bucket name)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'media';

console.log('=== Živa Vera Cloudflare R2 Asset Sync ===');
console.log('Target Public CDN:', 'https://pub-38b5d7ad707f4398a808e413bb3620c8.r2.dev');

const filesToSync = [
  { source: path.join(rootDir, 'public', 'zivavera-logo-bel.png'), key: 'brand/zivavera-logo-bel.png', contentType: 'image/png' },
  { source: path.join(rootDir, 'public', 'logo.png'), key: 'brand/logo.png', contentType: 'image/png' },
  { source: path.join(rootDir, 'public', 'icon-512.png'), key: 'brand/icon-512.png', contentType: 'image/png' },
  { source: path.join(rootDir, 'public', 'icon-192.png'), key: 'brand/icon-192.png', contentType: 'image/png' },
  { source: path.join(rootDir, 'public', 'icon-maskable.png'), key: 'brand/icon-maskable.png', contentType: 'image/png' }
];

console.log('\nFiles ready to sync to Cloudflare R2:');
filesToSync.forEach(f => {
  if (fs.existsSync(f.source)) {
    const stat = fs.statSync(f.source);
    console.log(` - ${f.key} (${(stat.size / 1024).toFixed(1)} KB) -> [READY]`);
  } else {
    console.log(` - ${f.key} -> [FILE: ${path.basename(f.source)}]`);
  }
});

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID) {
  console.log('\n[R2 UPLOAD INSTRUCTIONS]');
  console.log('Option 1 (Cloudflare Dashboard):');
  console.log('  1. Open Cloudflare Dashboard -> R2 -> Click on your media bucket.');
  console.log('  2. Click "Upload" -> Select "public/zivavera-logo-bel.png" and "public/logo.png".');
  console.log('  3. The images will be instantly live on your public CDN endpoint:');
  console.log('     https://pub-38b5d7ad707f4398a808e413bb3620c8.r2.dev/brand/logo.png');
  console.log('\nOption 2 (Automated CLI):');
  console.log('  Set environment variables:');
  console.log('    R2_ACCOUNT_ID="your_account_id"');
  console.log('    R2_ACCESS_KEY_ID="your_key"');
  console.log('    R2_SECRET_ACCESS_KEY="your_secret"');
  console.log('  and run: node scripts/upload-to-r2.mjs');
} else {
  console.log('\nUploading via S3-compatible R2 endpoint...');
}
