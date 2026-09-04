import crypto from 'crypto';

const ACCOUNT_ID = "988f40900512ba0fb55a34e0bbfc7ab3";
const ACCESS_KEY_ID = "e96fc3fc5a766c5a05c6c88d17cadeb4";
const SECRET_ACCESS_KEY = "7b4f0541e4bae492fcb973235e1f39b3511c21a94e44ee805dc377dfedf7375a";
const BUCKET_NAME = "kck-media";
const REGION = "auto";

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

async function s3Request({ method, path, query = '', body = '', headers = {} }) {
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET_NAME}${path.startsWith('/') ? path : '/' + path}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = sha256(body);

  const reqHeaders = {
    ...headers,
    'host': host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  const sortedHeaderKeys = Object.keys(reqHeaders).map(k => k.toLowerCase()).sort();
  const canonicalHeaders = sortedHeaderKeys.map(k => `${k}:${reqHeaders[k]}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  // Format canonical query
  const canonicalQuery = query ? (query.includes('=') ? query : query + '=') : '';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n');

  const signingKey = getSignatureKey(SECRET_ACCESS_KEY, dateStamp, REGION, 's3');
  const signature = hmacHex(signingKey, stringToSign);

  reqHeaders['Authorization'] = `${algorithm} Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const fullUrl = `https://${host}${canonicalUri}${query ? '?' + query : ''}`;
  const res = await fetch(fullUrl, {
    method,
    headers: reqHeaders,
    body: body ? body : undefined
  });

  return {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    text: await res.text()
  };
}

async function run() {
  console.log('--- Checking current Bucket CORS ---');
  const getCors = await s3Request({ method: 'GET', path: '', query: 'cors' });
  console.log('GET CORS response:', getCors.status, getCors.text);

  console.log('\n--- Setting Bucket CORS to allow *.kalvarija.si and localhost ---');
  const corsXml = `<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
      <AllowedOrigin>https://*.kalvarija.si</AllowedOrigin>
      <AllowedOrigin>https://kalvarija.si</AllowedOrigin>
      <AllowedOrigin>https://zivavera.kalvarija.si</AllowedOrigin>
      <AllowedOrigin>http://localhost:8080</AllowedOrigin>
      <AllowedOrigin>http://localhost:5173</AllowedOrigin>
      <AllowedOrigin>http://localhost:3000</AllowedOrigin>
      <AllowedOrigin>*</AllowedOrigin>
      <AllowedMethod>GET</AllowedMethod>
      <AllowedMethod>PUT</AllowedMethod>
      <AllowedMethod>POST</AllowedMethod>
      <AllowedMethod>HEAD</AllowedMethod>
      <AllowedMethod>DELETE</AllowedMethod>
      <AllowedHeader>*</AllowedHeader>
      <ExposeHeader>ETag</ExposeHeader>
      <MaxAgeSeconds>3600</MaxAgeSeconds>
    </CORSRule>
  </CORSConfiguration>`;

  const putCors = await s3Request({
    method: 'PUT',
    path: '',
    query: 'cors',
    body: corsXml,
    headers: {
      'content-type': 'application/xml',
      'content-md5': crypto.createHash('md5').update(corsXml).digest('base64')
    }
  });
  console.log('PUT CORS response:', putCors.status, putCors.text);
}

run();
