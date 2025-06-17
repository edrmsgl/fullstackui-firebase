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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 via-60% to-pink-400">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Hoşgeldin</h1>
        <div className="text-center">
          <p>{email}</p>
          <button onClick={handleLogout} className="cursor-pointer">Çıkış Yap</button>
        </div>
      </div>
    </div>
  );
}
