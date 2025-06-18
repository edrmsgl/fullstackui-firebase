'use client';

import Menu from "@/app/components/Menu";
import TopBar from "@/app/components/Topbar";

export default function dashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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