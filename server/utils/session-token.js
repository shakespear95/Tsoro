/**
 * HMAC-SHA256 session token sign/verify.
 */
import { createHmac } from 'node:crypto';
import { config } from '../config/env.js';

/**
 * Create a signed session token for a user.
 */
export function createSessionToken(uid) {
  const expiryMs = Date.now() + config.SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
  const payload = JSON.stringify({ uid, exp: expiryMs });
  const signature = sign(payload);
  // base64url encode payload + . + signature
  const b64Payload = Buffer.from(payload).toString('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verify a session token and return the uid if valid.
 * Returns null if invalid or expired.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const dotIdx = token.indexOf('.');
  if (dotIdx === -1) return null;

  const b64Payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);

  let payload;
  try {
    payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString());
  } catch {
    return null;
  }

  // Verify signature
  const expected = sign(JSON.stringify(payload));
  if (sig !== expected) return null;

  // Check expiry
  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;

  return payload.uid;
}

function sign(data) {
  return createHmac('sha256', config.SESSION_SECRET)
    .update(data)
    .digest('base64url');
}
