/**
 * Firebase client-side configuration.
 * This config is public (no secrets) — it identifies the Firebase project.
 *
 * IMPORTANT: Replace these values with your actual Firebase project config.
 * Get them from Firebase Console → Project Settings → General → Your apps.
 */

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

/**
 * Initialize Firebase if not already initialized.
 */
export function initFirebaseClient() {
  /* global firebase */
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded — online features disabled');
    return false;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return true;
}
