
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAENqEcBExyEYdXVk25PyHQ4uEQdmPqU6o",
  authDomain: "we-care-a1cb0.firebaseapp.com",
  projectId: "we-care-a1cb0",
  storageBucket: "we-care-a1cb0.appspot.com",
  messagingSenderId: "612095138502",
  appId: "1:612095138502:web:4405731ec210b82784d5c7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const authentication = getAuth(app);