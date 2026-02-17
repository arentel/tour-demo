import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDfFmQTzMhr-Eyl__MSDVNOYuuf8pv7aEY',
  authDomain: 'tour-demo-bffd9.firebaseapp.com',
  projectId: 'tour-demo-bffd9',
  storageBucket: 'tour-demo-bffd9.firebasestorage.app',
  messagingSenderId: '458548457247',
  appId: '1:458548457247:web:6388750a5aa60a28b38a2a',
  measurementId: 'G-QMLQ8Z1Z2C',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
