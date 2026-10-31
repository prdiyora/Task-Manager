// Encrypt data.plain.json -> data.js (AES-GCM, key from password via PBKDF2).
// Usage: node scripts/encrypt.mjs <plaintext.json> <password-file> <output data.js>
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
const [,, plainPath, pwPath, outPath] = process.argv;
const subtle = webcrypto.subtle;
const b64 = (buf) => Buffer.from(buf).toString('base64');
const password = readFileSync(pwPath, 'utf8').trim();
const plaintext = readFileSync(plainPath, 'utf8');
const salt = webcrypto.getRandomValues(new Uint8Array(16));
const iv = webcrypto.getRandomValues(new Uint8Array(12));
const iter = 250000;
const km = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
const envelope = { v: 1, kdf: 'PBKDF2-SHA256', iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
writeFileSync(outPath, '// Encrypted dashboard data - unlocks with the site password (see README).\nwindow.ENCRYPTED_DATA = ' + JSON.stringify(envelope) + ';\n');
console.log('Encrypted -> ' + outPath + ' (' + envelope.ct.length + ' chars ct)');
