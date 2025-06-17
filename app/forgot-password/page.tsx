"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebaseConfig";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [emailError, setEmailError] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setEmailError(true);
            setError("E-posta adresi zorunludur.");
            setSuccess("");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
            setError("");
            setEmailError(false);
        } catch (err: any) {
            setError("Şifre sıfırlama işlemi başarısız: " + err.message);
            setSuccess("");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 via-60% to-pink-400">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800">Şifremi Unuttum</h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                {success && <p className="text-green-600 text-sm text-center">{success}</p>}

                <input
                    type="email"
                    placeholder="Eposta adresiniz"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value.trim() !== "") {
                            setEmailError(false);
                            setError("");
                        }
                    }}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${emailError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                />

                <button
                    onClick={handleResetPassword}
                    className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
                >
                    Şifre Sıfırlama Bağlantısı Gönder
                </button>

                <p className="text-center text-sm text-gray-700">
                    Giriş sayfasına dön:{" "}
                    <button
                        onClick={() => router.push("/signin")}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Giriş Yap
                    </button>
                </p>
            </div>
        </div>
    );
}