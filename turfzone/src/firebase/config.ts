// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjfm-VmPWnqOb82xa_sJDMv_JC6olQQC8",
  authDomain: "kishore0-0-7.firebaseapp.com",
  projectId: "kishore0-0-7",
  storageBucket: "kishore0-0-7.firebasestorage.app",
  messagingSenderId: "247636667089",
  appId: "1:247636667089:web:df661011e9506d8528b3f0",
  measurementId: "G-CSSCB6E3FG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
