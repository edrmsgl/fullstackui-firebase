'use client';
import React from 'react'
import TextsmsIcon from '@mui/icons-material/Textsms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { Input, Tooltip } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/app//firebaseConfig"
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

const TopBar = () => {

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
    <div className='flex items-center justify-end lg:justify-between'>
      <div className='hidden search relative rounded-full border border-gray-300 px-3 py-1.5 gap-2.5 lg:flex justify-center items-center'>
        <SearchIcon className='text-gray-400' />
        <Input placeholder='Search' className='text-xs! min-w-60' />
      </div>
      <div className='userbar flex items-center justify-end gap-8'>
        <div className='flex justify-center items-center rounded-full bg-white w-10 h-10 cursor-pointer'>
          <Tooltip title="Mesajlar">
            <TextsmsIcon /></Tooltip></div>
        <div className='flex justify-center items-center rounded-full bg-white w-10 h-10 cursor-pointer relative'>
          <Tooltip title="Bildirimler">
            <NotificationsIcon />
          </Tooltip>
          <div className='absolute -right-2 -top-2 bg-indigo-600 w-6 h-6 text-white flex justify-center items-center rounded-full border-2 border-white text-sm'>5</div>
        </div>
        <div className='userFullName text-right leading-5'>
          <h3 className='font-bold'>{email}</h3>
        </div>
        <div className='userPicture relative'>
          <Image src={'https://randomuser.me/api/portraits/men/4.jpg'} alt='' width={50} height={50} unoptimized className='rounded-full overflow-hidden' />
          <div className='absolute right-0 bottom-0 bg-green-600 w-3.5 h-3.5 rounded-full border-2 border-white' />
        </div>

        <button onClick={handleLogout} className="cursor-pointer">Çıkış Yap</button>
      </div>
    </div>
  )
}

export default TopBar;