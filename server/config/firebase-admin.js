/**
 * Firebase Admin SDK initialization.
 */
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'node:fs';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let firebaseApp = null;

export function initFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    const options = {};

    if (config.FIREBASE_SERVICE_ACCOUNT) {
      if (existsSync(config.FIREBASE_SERVICE_ACCOUNT)) {
        const raw = readFileSync(config.FIREBASE_SERVICE_ACCOUNT, 'utf-8');
        options.credential = admin.credential.cert(JSON.parse(raw));
      } else {
        // Assume it's a JSON string
        options.credential = admin.credential.cert(JSON.parse(config.FIREBASE_SERVICE_ACCOUNT));
      }
    } else {
      // Use application default credentials
      options.credential = admin.credential.applicationDefault();
    }

    firebaseApp = admin.initializeApp(options);
    logger.info('Firebase Admin initialized');
    return firebaseApp;
  } catch (err) {
    logger.error('Firebase Admin init failed:', err.message);
    throw err;
  }
}

/**
 * Verify a Firebase ID token and return the decoded claims.
 */
export async function verifyIdToken(idToken) {
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded;
}
