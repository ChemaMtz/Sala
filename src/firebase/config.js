// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSVXaEttnWkVilULncGMXoLodKEWsUU2o",
  authDomain: "basedatos-m.firebaseapp.com",
  projectId: "basedatos-m",
  storageBucket: "basedatos-m.firebasestorage.app",
  messagingSenderId: "560580028581",
  appId: "1:560580028581:web:9b5e5b15ad1adbebe2054c",
  measurementId: "G-208YD29BQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics
const analytics = getAnalytics(app);

export { analytics };
export default app;
