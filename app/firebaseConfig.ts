import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDOQ2ovrSV4cxeXhGqO70JpiDtL4hSOk5o",
  authDomain: "fullstackui-fire.firebaseapp.com",
  projectId: "fullstackui-fire",
  storageBucket: "fullstackui-fire.firebasestorage.app",
  messagingSenderId: "588714466824",
  appId: "1:588714466824:web:765c2c0c88eeb69f80fbbd"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);