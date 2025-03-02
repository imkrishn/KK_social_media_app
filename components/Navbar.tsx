'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import logo from '@/app/favicon.ico'
import { useTheme } from 'next-themes'

const Navbar = () => {
  const [onDarkMode, setOnDarkMode] = useState(false);
  const { setTheme } = useTheme()

  function onDarkTheme() {
    setTheme('light');
    setOnDarkMode(true)
  }

  function onLightTheme() {
    setTheme('dark');
    setOnDarkMode(false)
  }

  return (
    <nav className='rounded-xl bg-black shadow-sm flex items-center  p-4 gap-4 my-4'>
      <Image src={logo} alt='#' className='w-36 lg:mx-11 ' />
      <div className='text-2xl text-green-500 w-full ml-1'>--------------------------------------------------------</div>
      {onDarkMode ? <svg onClick={onLightTheme} className='h-12 mx-11 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="#74C0FC" d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" /></svg>
        : <svg onClick={onDarkTheme} className='h-12 mx-11 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="#74C0FC" d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z" /></svg>}
    </nav>
  )
}

export default Navbar