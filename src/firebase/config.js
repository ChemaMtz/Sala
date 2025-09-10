// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQ5WfHhVnHClDS1lMCDS1EuQahejoSEs4",
  authDomain: "salar-3089a.firebaseapp.com",
  projectId: "salar-3089a",
  storageBucket: "salar-3089a.firebasestorage.app",
  messagingSenderId: "9306042415",
  appId: "1:9306042415:web:bad149527f50016a2956da",
  measurementId: "G-FYC31GKCJ0"
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

// Initialize Analytics (optional)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export default app;
