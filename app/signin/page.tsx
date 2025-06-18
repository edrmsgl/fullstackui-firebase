'use client';
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebaseConfig";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard/main');
    } catch (error: any) {
      alert('Eposta ve şifre hatalı');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 via-60% to-pink-400">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Giriş Yap</h1>

        <input
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Eposta"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          type="password"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Şifre"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
          onClick={handleSignIn}
        >
          Giriş Yap
        </button>

        <p className="text-center text-sm text-gray-700">
          Henüz üye değil misiniz?{" "}
          <button
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Kayıt Ol
          </button>
        </p>

        <div className="text-center text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => router.push("/forgot-password")}>
          Şifremi unuttum
        </div>
      </div>
    </div>

  );
}