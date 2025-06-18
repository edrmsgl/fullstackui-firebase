"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Button, FormControlLabel, Input, MenuItem, Radio, RadioGroup } from "@mui/material";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor" | "">("");
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

  const handleSignup = async () => {
    let hasError = false;

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), {
        email,
        role,
        createdAt: new Date(),
        profileCompleted: false
      });

      if (role === "student") {
        await setDoc(doc(db, "students", uid), { email, createdAt: new Date(), });
        router.push(`/complete-profile/student?uid=${uid}`);
      } else if (role === "instructor") {
        await setDoc(doc(db, "instructors", uid), { email, createdAt: new Date(), });
        router.push(`/complete-profile/instructor?uid=${uid}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 via-60% to-pink-400">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Kayıt Ol</h1>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div className="flex items-center justify-start gap-5">
          <label className="w-40">Eposta</label>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
        </div>

        <div className="flex items-center justify-start gap-5">
          <label className="w-40">Şifre</label>
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${passwordError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
        </div>

        <div className="flex items-center justify-start gap-5">
          <label className="w-40">Tipi</label>

          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue=""
            name="radio-buttons-group"
            onChange={(e) => setRole(e.target.value as "student" | "instructor")}
          >
            <FormControlLabel value="student" control={<Radio />} labelPlacement="end" label="Öğrenci" />
            <FormControlLabel value="instructor" control={<Radio />} labelPlacement="end" label="Eğitmen" />
          </RadioGroup>
        </div>

        <Button
          onClick={handleSignup}
          className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
        >
          Kayıt Ol
        </Button>

        <p className="text-center text-sm text-gray-700">
          Zaten hesabınız var mı?{" "}
          <Button
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/signin")}
          >
            Giriş Yap
          </Button>
        </p>
      </div>
    </div>
  );
}