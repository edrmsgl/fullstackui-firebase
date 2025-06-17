'use client';
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function AuthListener() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Kullanıcı durumu:", user ? "Giriş yapıldı" : "Çıkış yapıldı");
    });
    return () => unsubscribe();
  }, []);

  return null;
}