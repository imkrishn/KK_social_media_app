'use client'

import { setCurrentMsgUser } from '@/redux/slices/currentMsgUser'
import { AppDispatch, RootState } from '@/redux/store'
import { useTheme } from 'next-themes'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'

const SideBar = ({ setInterfaceType, setSetting }: { setInterfaceType: (opr: Type) => void, setSetting: (opr: boolean) => void }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>()
  const notification = useSelector((state: RootState) => state.notification);

  function onDivClick(opr: Type) {
    setInterfaceType(opr)
  }

  function onMessagesClick() {
    dispatch(setCurrentMsgUser({ $id: null, isFlag: false }))
    setInterfaceType('Messages')
  }




  return (
    <div className={`relative rounded-xl w-60 select-none flex flex-col items-center gap-5 p-7 h-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className='flex items-center gap-2 w-full'>
        <svg className='h-7' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill={theme !== 'dark' ? "#ffffff" : "#000000"} d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
        <span onClick={() => onDivClick('Home')} className=' cursor-pointer active:scale-95 w-full'>Home</span>
      </div>
      <div className='flex items-center gap-2 w-full'>
        <svg className='h-7' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill={theme !== 'dark' ? "#ffffff" : "#000000"} d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" /></svg>
        <span onClick={() => onDivClick('Profile')} className='ml-1 cursor-pointer active:scale-95 w-full'> Profile</span>
      </div>
      <div className='flex items-center gap-2 w-full'>
        <svg className='h-7' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme !== 'dark' ? "#ffffff" : "#000000"} d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
        <span onClick={() => onDivClick('Explore')} className=' cursor-pointer active:scale-95 w-full'>Explore</span>
      </div>
      <div className='flex items-center gap-2 w-full'>
        <svg className='h-7' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme !== 'dark' ? "#ffffff" : "#000000"} d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" /></svg>
        <span onClick={onMessagesClick} className=' cursor-pointer active:scale-95 '>Messages</span>
        {notification && notification > 0 && <p className='bg-red-500 px-2 rounded-full'>{notification}</p>}
      </div>
      <div className='flex items-center gap-2 w-full'>
        <svg className='h-7' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme !== 'dark' ? "#ffffff" : "#000000"} d="M512 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l128 0c20.1 0 39.1 9.5 51.2 25.6l19.2 25.6c6 8.1 15.5 12.8 25.6 12.8l160 0c35.3 0 64 28.7 64 64l0 256zM232 376c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64 64 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0 0-64c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 64-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l64 0 0 64z" /></svg>
        <span onClick={() => onDivClick('Create')} className=' cursor-pointer active:scale-95 w-full'>Create</span>
      </div>
      <svg onClick={() => setSetting(true)} className='h-7 absolute bottom-7 left-7 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme !== 'dark' ? "#ffffff" : "#000000"} d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" /></svg>
    </div>
  )
}

export default SideBar