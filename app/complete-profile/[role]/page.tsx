"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Avatar,
  Button,
  Input,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Checkbox,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

export default function CompleteProfile() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<"student" | "instructor" | "">("");
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [picture, setPicture] = useState<string | undefined>(undefined);
  const [dob, setDob] = useState<Dayjs | null>(null);
  const [address, setAddress] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  const specialList = ["Futbol", "Basketbol", "Hentbol", "Yüzme", "Voleybol", "Tenis"];

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 224,
        width: 250,
      },
    },
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }

      const uid = user.uid;
      setUid(uid);

      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        router.push("/signin");
        return;
      }

      const userData = userDoc.data();
      setRole(userData.role);
      if (userData.name) setFullName(userData.name);
      if (userData.phone) setPhone(userData.phone);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!fullName || !phone || !dob || !role) return;
    try {
      await updateDoc(doc(db, "users", uid), {
        name: fullName,
        phone,
        profileCompleted: true,
        dob: dob.format("DD-MM-YYYY"),
        picture: picture || "",
        specialties: role === "instructor" ? specialties : [],
      });

      const targetCollection = role === "student" ? "students" : "instructors";
      await updateDoc(doc(db, targetCollection, uid), {
        name: fullName,
        phone,
        dob: dob.format("DD-MM-YYYY"),
        picture: picture || "",
        specialties: role === "instructor" ? specialties : [],
      });

      router.push("/dashboard/main");
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSpecialties(typeof value === "string" ? value.split(",") : value);
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center text-gray-800">Profil Bilgilerini Tamamla</h2>

        <Input
          type="text"
          placeholder="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
        />

        <Input
          type="tel"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Doğum Tarihi"
            value={dob}
            onChange={(newValue) => setDob(newValue)}
            format="DD-MM-YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined",
              },
            }}
          />
        </LocalizationProvider>

        <div className="space-y-2">
          <Avatar src={picture} alt="Profil" sx={{ width: 80, height: 80 }} />
          <input
            disabled={loading}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>

        {role === "instructor" && (
          <>
            <Typography>Branş(lar):</Typography>
            <Select
              multiple
              fullWidth
              value={specialties}
              onChange={handleChange}
              input={<OutlinedInput label="Branş" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {specialList.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={specialties.includes(name)} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 2, bgcolor: "blue.600", ":hover": { bgcolor: "blue.700" } }}
        >
          Kaydet ve Devam Et
        </Button>
      </div>
    </div>
  );
}