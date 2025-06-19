'use client';

import Menu from "@/app/components/Menu";
import TopBar from "@/app/components/Topbar";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/firebaseConfig';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function dashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/signin');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Yükleniyor...</p>;
  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/8">
        <Menu />
      </div>
      <div className="w-7/8 bg-rightSide p-5">
        <TopBar />
        {children}</div>
    </div>
  );
}