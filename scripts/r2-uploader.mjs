import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ACCOUNT_ID = '988f40900512ba0fb55a34e0bbfc7ab3';
const ACCESS_KEY_ID = 'e96fc3fc5a766c5a05c6c88d17cadeb4';
const SECRET_ACCESS_KEY = '7b4f0541e4bae492fcb973235e1f39b3511c21a94e44ee805dc377dfedf7375a';
const BUCKET_NAME = 'kck-media';
const REGION = 'auto';

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function hmacHex(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, 'aws4_request');
  return kSigning;
}

export async function uploadFileToR2(localFilePath, r2Key, contentType = 'image/png') {
  if (!fs.existsSync(localFilePath)) {
    console.error(`[R2 Uploader] File not found: ${localFilePath}`);
    return { success: false, error: 'File not found' };
  }

  const fileData = fs.readFileSync(localFilePath);
  const payloadHash = sha256(fileData);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET_NAME}/${r2Key.startsWith('/') ? r2Key.slice(1) : r2Key}`;

  // Canonical headers (must be sorted alphabetically)
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest =
    `PUT\n` +
    `${canonicalUri}\n` +
    `\n` + // Canonical query string (empty)
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const stringToSign =
    `${algorithm}\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    `${sha256(canonicalRequest)}`;

  const signingKey = getSignatureKey(SECRET_ACCESS_KEY, dateStamp, REGION, 's3');
  const signature = hmacHex(signingKey, stringToSign);

  const authorizationHeader =
    `${algorithm} ` +
    `Credential=${ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  const url = `https://${host}${canonicalUri}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Host': host,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'Authorization': authorizationHeader,
      },
      body: fileData,
    });

    if (res.ok) {
      console.log(`[R2 Uploader] [SUCCESS] Uploaded ${r2Key} (${(fileData.length / 1024).toFixed(1)} KB) -> Status: ${res.status}`);
      return { success: true, key: r2Key, size: fileData.length };
    } else {
      const errText = await res.text();
      console.error(`[R2 Uploader] [FAILED] ${r2Key} -> Status: ${res.status} ${res.statusText}`, errText);
      return { success: false, status: res.status, error: errText };
    }
  } catch (err) {
    console.error(`[R2 Uploader] [NETWORK ERROR] ${r2Key}:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function syncAllToR2() {
  console.log('=== Starting Cloudflare R2 Upload ===');
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Account: ${ACCOUNT_ID}`);

  const uploads = [
    { file: path.join(rootDir, 'public', 'zivavera-logo-bel.png'), key: 'zivavera-logo-bel.png', type: 'image/png' },
    { file: path.join(rootDir, 'public', 'zivavera-logo-bel.png'), key: 'brand/zivavera-logo-bel.png', type: 'image/png' },
    { file: path.join(rootDir, 'public', 'logo.png'), key: 'brand/logo.png', type: 'image/png' },
    { file: path.join(rootDir, 'public', 'logo.png'), key: 'zivavera/logo.png', type: 'image/png' },
    { file: path.join(rootDir, 'public', 'icon-512.png'), key: 'brand/icon-512.png', type: 'image/png' },
    { file: path.join(rootDir, 'public', 'icon-192.png'), key: 'brand/icon-192.png', type: 'image/png' },
    { file: path.join(rootDir, 'public', 'icon-maskable.png'), key: 'brand/icon-maskable.png', type: 'image/png' },
  ];

  const results = [];
  for (const item of uploads) {
    if (fs.existsSync(item.file)) {
      const res = await uploadFileToR2(item.file, item.key, item.type);
      results.push({ ...item, ...res });
    }
  }

  console.log('=== Finished Cloudflare R2 Upload ===');
  return results;
}

// If invoked directly
syncAllToR2();
