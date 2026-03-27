import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHB0hERxNbCsos_kPBdWMBluRdrObRCwY",
  authDomain: "coaching-app-7e2a4.firebaseapp.com",
  projectId: "coaching-app-7e2a4",
  storageBucket: "coaching-app-7e2a4.firebasestorage.app",
  messagingSenderId: "144286518591",
  appId: "1:144286518591:web:2d09372d6e8059d461578a",
  measurementId: "G-P1K2FRCP24"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);