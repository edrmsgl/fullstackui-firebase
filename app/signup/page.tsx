"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebaseConfig";

export default function Signup() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (e.target.value.trim() !== "") {
            setEmailError(false);
            if (password.trim() !== "") setError("");
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (e.target.value.trim() !== "") {
            setPasswordError(false);
            if (email.trim() !== "") setError("");
        }
    };

    const handleSignup = async (e?: React.FormEvent) => {
        e?.preventDefault();

        let hasError = false;

        if (password.length < 6) {
            setPasswordError(true);
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setEmailError(true);
            setError("Geçerli bir e-posta adresi giriniz.");
            return;
        }

        if (email.trim() === "") {
            setEmailError(true);
            hasError = true;
        }

        if (password.trim() === "") {
            setPasswordError(true);
            hasError = true;
        }

        if (hasError) {
            setError("E-posta ve şifre alanları boş bırakılamaz.");
            return;
        }

        setError("");
        setEmailError(false);
        setPasswordError(false);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard/main");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 via-60% to-pink-400">
            <form
                onSubmit={handleSignup}
                className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
            >
                <h1 className="text-2xl font-bold text-center text-gray-800">Kayıt Ol</h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                <input
                    type="email"
                    placeholder="Eposta"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                />

                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${passwordError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                />

                <button
                    type="submit"
                    className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
                >
                    Kayıt Ol
                </button>

                <p className="text-center text-sm text-gray-700">
                    Zaten hesabınız var mı?{" "}
                    <button
                        type="button"
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => router.push("/signin")}
                    >
                        Giriş Yap
                    </button>
                </p>
            </form>
        </div>
    );
}