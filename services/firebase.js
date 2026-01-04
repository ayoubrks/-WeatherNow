import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace the placeholder values below with your Firebase project configuration.
// You can copy these values from your Firebase console: Project settings > General > Your apps.
const firebaseConfig = {
  apiKey: 'AIzaSyCn_PAKWXDqMkEGD_rByKnQBlubl1ztMqo',
  authDomain: 'meteo-2e972.firebaseapp.com',
  projectId: 'meteo-2e972',
  storageBucket: 'meteo-2e972.firebasestorage.app',
  messagingSenderId: '208952203694',
  appId: '1:208952203694:web:eed611c8e72612f203103f',
};

const firebaseApps = getApps();
const app = firebaseApps.length ? firebaseApps[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
