'use client';
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/app//firebaseConfig"
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function MainPage() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/signin");
    } catch (error: any) {
      alert("Çıkış hatası: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
      } else {
        setEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!email) return null

  return (
    ':)'
  );
}
