"use client";
import React, { useEffect, useState } from "react";
import TextsmsIcon from "@mui/icons-material/Textsms";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { Input, Tooltip } from "@mui/material";
import Image from "next/image";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

const TopBar = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [picture, setPicture] = useState<string>("");
  const [role, setRole] = useState<string>("");
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);
        const uid = user.uid;
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullName(userData.name || "");
          setPicture(userData.picture || "");
          setRole(userData.role || "");
        }
      } else {
        setEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!email) return null;

  return (
    <div className='flex items-center justify-end lg:justify-between'>
      <div className='hidden search relative rounded-full border border-gray-300 px-3 py-1.5 gap-2.5 lg:flex justify-center items-center'>
        <SearchIcon className='text-gray-400' />
        <Input placeholder='Ne aramıştınız?' className='text-xs! min-w-60' />
      </div>
      <div className='userbar flex items-center justify-end gap-8'>
        <div className='flex justify-center items-center rounded-full bg-white w-10 h-10 cursor-pointer'>
          <Tooltip title="Mesajlar">
            <TextsmsIcon />
          </Tooltip>
        </div>
        <div className='flex justify-center items-center rounded-full bg-white w-10 h-10 cursor-pointer relative'>
          <Tooltip title="Bildirimler">
            <NotificationsIcon />
          </Tooltip>
          <div className='absolute -right-2 -top-2 bg-btnHover w-6 h-6 text-white flex justify-center items-center rounded-full border-2 border-white text-sm'>5</div>
        </div>
        <div className='userFullName text-right leading-5'>
          <h3 className='font-bold'>{fullName}</h3>
          <p className='text-sm text-gray-500'>{role === 'admin' ? 'Yönetici'  : role === 'instructor' ? 'Eğitmen' : 'Öğrenci'}</p>
        </div>
        <div className='userPicture relative'>
          <Image
            src={picture || "https://via.placeholder.com/50"}
            alt='Profil'
            width={50}
            height={50}
            unoptimized
            className='rounded-full overflow-hidden'
          />
          <div className='absolute right-0 bottom-0 bg-green-600 w-3.5 h-3.5 rounded-full border-2 border-white' />
        </div>

        <button onClick={handleLogout} className="cursor-pointer">
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default TopBar;
