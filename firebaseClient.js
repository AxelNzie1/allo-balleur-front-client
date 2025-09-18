// firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, RecaptchaVerifier } from "firebase/auth";

// Configuration Firebase Web SDK (depuis ta console)
const firebaseConfig = {
  apiKey: "AIzaSyAFGwOpn50NbvbM5lWJx9odM79Sj_rRXU",
  authDomain: "allo-bailleur.firebaseapp.com",
  projectId: "allo-bailleur",
  storageBucket: "allo-bailleur.firebasestorage.app",
  messagingSenderId: "511246037066",
  appId: "1:511246037066:web:0dd3bf8a897bb4a63876b3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
