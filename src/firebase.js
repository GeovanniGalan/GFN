// src/firebase.js

// Import the necessary Firebase modules.
// 'initializeApp' is used to initialize your Firebase project.
import { initializeApp } from 'firebase/app';
// 'getAuth' provides the Firebase Authentication service instance.
import { getAuth } from 'firebase/auth';
// 'getFirestore' provides the Cloud Firestore database service instance.
import { getFirestore } from 'firebase/firestore';

// Your Firebase project's configuration.
// IMPORTANT: Replace these placeholder values with your actual Firebase project configuration.
// You can find these in your Firebase project console under Project settings -> General -> Your apps.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",               // Your Firebase API Key
  authDomain: "YOUR_AUTH_DOMAIN",       // Your Firebase Auth Domain
  projectId: "YOUR_PROJECT_ID",         // Your Firebase Project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Your Firebase Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Your Firebase Messaging Sender ID
  appId: "YOUR_APP_ID",                 // Your Firebase App ID
  measurementId: "YOUR_MEASUREMENT_ID"  // Your Firebase Measurement ID (optional, for analytics)
};

// Initialize Firebase with your configuration.
// This creates a Firebase app instance.
const app = initializeApp(firebaseConfig);

// Get the authentication service instance.
// We'll use this 'auth' object throughout our app for login, logout, etc.
const auth = getAuth(app);

// Get the Cloud Firestore database service instance.
// We'll use this 'db' object to read from and write to our Firestore database.
const db = getFirestore(app);

// Export 'auth' and 'db' so they can be imported and used in other files.
export { auth, db };