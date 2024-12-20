import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdHmnVbXXxN8gz3hs9ipgQV-WxzD5U-ow",
  authDomain: "dadbingo-4079f.firebaseapp.com",
  projectId: "dadbingo-4079f",
  storageBucket: "dadbingo-4079f.appspot.com",
  messagingSenderId: "1007171650916",
  appId: "1:1007171650916:web:b5e8de98c57031aa456671",
  measurementId: "G-2X3Q9DGH1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Get Firestore instance
const db = getFirestore(app);

export { db };
