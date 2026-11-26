
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLtihIS3vWT-qnu43GKPjIIhLK9f76srU",
  authDomain: "polleria-51d62.firebaseapp.com",
  databaseURL: "https://polleria-51d62-default-rtdb.firebaseio.com",
  projectId: "polleria-51d62",
  storageBucket: "polleria-51d62.firebasestorage.app",
  messagingSenderId: "56419872585",
  appId: "1:56419872585:web:119774f9b87db8f5673498",
  measurementId: "G-0GC6BJGK2V"
};

const app = initializeApp(firebaseConfig);

// Base de datos
export const db = getDatabase(app);

// Autenticación
export const auth = getAuth(app);
