// firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "allo-bailleur.firebaseapp.com",
  projectId: "allo-bailleur",
  storageBucket: "allo-bailleur.appspot.com",
  messagingSenderId: "511246037066",
  appId: "1:511246037066:web:0dd3bf8a897bb4a63876b3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
