import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth , GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHB6tJjq0IQOy-Sa-bwFjsiZnIDt89BSg",
  authDomain: "cultivapreciso2.firebaseapp.com",
  projectId: "cultivapreciso2",
  storageBucket: "cultivapreciso2.firebasestorage.app",
  messagingSenderId: "538511460380",
  appId: "1:538511460380:web:99401c8b63a4849ceab7d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Variables para obtener funcionalidad de autenticación
const auth = getAuth(app);
const GoogleProvider = new GoogleAuthProvider();

// Conexion a db
const db = getFirestore(app);

export {auth,GoogleProvider,db,signOut}