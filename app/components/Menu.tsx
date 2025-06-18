'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SportsIcon from '@mui/icons-material/Sports';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import LocalSeeIcon from '@mui/icons-material/LocalSee';
import MarkUnreadChatAltOutlinedIcon from '@mui/icons-material/MarkUnreadChatAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const MenuItems = [
  { icon: <HomeIcon />, title: 'Anasayfa', url: '/dashboard/admin' },
  { icon: <SchoolIcon />, title: 'Eğitmenler', url: '/dashboard/instructors' },
  { icon: <GroupIcon />, title: 'Öğrenciler', url: '/dashboard/students' },
  { icon: <Diversity3Icon />, title: 'Yaş Grupları', url: '/dashboard/agegroups' },
  { icon: <SportsIcon />, title: 'Spor Dalları', url: '/dashboard/branches' },
  { icon: <CalendarMonthIcon />, title: 'Sezonlar & Yıllar', url: '/dashboard/seasons' },
  { icon: <AttachMoneyIcon />, title: 'Ödemeler', url: '/dashboard/billings' },
  { icon: <MarkUnreadChatAltOutlinedIcon />, title: 'Sosyal', url: '/dashboard/social' },
  { icon: <LocalSeeIcon />, title: 'Resimler', url: '/dashboard/pictures' },
  { icon: <OndemandVideoIcon />, title: 'Videolar', url: '/dashboard/videoos' },
  { icon: <SettingsOutlinedIcon />, title: 'Ayarlar', url: '/dashboard/settings' },
  { icon: <LogoutOutlinedIcon />, title: 'Çıkış', url: '/logout' },
];

const Menu = () => {
  return (
    <>
      <div className='logo flex lg:justify-start justify-center items-center mt-5 gap-2 ml-[15px]'>
        <Image src="/icons/stack.png" width={40} height={40} alt='' />
        <span className='font-bold hidden lg:block'>FullStack-UI</span>
      </div>
      <div className='mt-10 text-sm'>
        {MenuItems.map(items => (
          <Link href={items.url} key={items.url} className='my-3.5 mx-3.5 flex rounded-[10px] p-2 lg:justify-start justify-center items-center gap-4 hover:bg-indigo-200 hover:text-white text-gray-400'>
            <span className=''>{items.icon}</span>
            <span className='hidden lg:block font-light'>
              {items.title}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default Menu;