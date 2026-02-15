import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCFt2XtYV7GcwcS_d2BJNgUWHl-aqRw5OE",
  authDomain: "interview-ai-91b6d.firebaseapp.com",
  projectId: "interview-ai-91b6d",
  storageBucket: "interview-ai-91b6d.firebasestorage.app",
  messagingSenderId: "965896918080",
  appId: "1:965896918080:web:c93707ead2acca668cfba5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
