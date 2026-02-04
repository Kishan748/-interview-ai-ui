import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCrKHoVgVVfEY3W0Vh9tLqXQ-vj3BM9fY",
  authDomain: "interview-ai-91b6d.firebaseapp.com",
  projectId: "interview-ai-91b6d",
  storageBucket: "interview-ai-91b6d.firebasestorage.app",
  messagingSenderId: "783893447747",
  appId: "1:783893447747:web:f5e5e5c5f5e5e5c5f5e5e5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
