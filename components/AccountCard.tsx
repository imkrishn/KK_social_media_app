'use client'

import { onFollow, onUnfollow, isFollowing, isFollower } from '@/lib/onFollowUnfollow';
import { setCurrentMsgUser } from '@/redux/slices/currentMsgUser';
import { setCurrentViewingUserId } from '@/redux/slices/currentViewingUser';
import { setNotification } from '@/redux/slices/notification';
import { AppDispatch, RootState } from '@/redux/store';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

type User = {
  $id: string;
  fullName?: string;
  userName?: string;
  imageUrl?: string;
  dob?: string;
  onCount?: number;
};

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'

const AccountCard = ({ user, followBtn, interfaceType, setInterfaceType, chat }: { user: User, followBtn?: boolean, interfaceType?: Type, setInterfaceType?: (opr: Type) => void, chat?: boolean }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>()
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id);
  const notification = useSelector((state: RootState) => state.notification)
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);
  const [isFollowerUser, setIsFollowerUser] = useState<boolean>(false);



  useEffect(() => {
    async function fetchData() {
      const resFollowing = await isFollowing(user.$id, loggedInUserId);
      const resFollower = await isFollower(user.$id, loggedInUserId);
      setIsFollowingUser(resFollowing);
      setIsFollowerUser(resFollower);
    }

    fetchData();
  }, [user.$id, loggedInUserId]);

  const handleFollow = async () => {
    await onFollow(user.$id, loggedInUserId);
    setIsFollowingUser(true);
  };

  const handleUnfollow = async () => {

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unfollow this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unfollow!",
    });

    if (!result.isConfirmed) {
      return
    }

    await onUnfollow(user.$id, loggedInUserId);
    setIsFollowingUser(false);
  };

  function dispatchId() {
    if (chat) {
      dispatch(setCurrentMsgUser({ $id: user.$id, isFlag: true }))
      if (setInterfaceType) setInterfaceType('Messages')
      if (notification && user.onCount) dispatch(setNotification(notification - user.onCount))

      if (user.onCount) {
        user.onCount = undefined

      }
    } else {
      dispatch(setCurrentViewingUserId({ $id: user.$id }))
      if (interfaceType && setInterfaceType) setInterfaceType(interfaceType)
    }


  }

  return (
    <div key={user.$id} className={`flex w-full items-center gap-5 select-none cursor-pointer p-2 rounded-tl-lg shadow-inner  rounded-lg ${theme === 'dark' ? 'text-black ' : 'text-white'}`}>
      {user?.imageUrl ? (
        <Image src={user.imageUrl} width={100} height={100} alt='user' className='h-11 w-11 border-black rounded-full border' />
      ) : (
        <svg className='w-16 border rounded-full p-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
        </svg>
      )}
      <div onClick={dispatchId} className='w-full'>
        <p className='text-xl  w-full'>{user.fullName}</p>
        <p className='text-sm text-gray-700 font-extralight ml-5'>{user.userName}</p>
      </div>

      {followBtn && loggedInUserId !== user.$id && <>{isFollowingUser ? (
        <button onClick={handleUnfollow} className="inline-flex m-4 min-w-28 active:scale-95 h-7 animate-shimmer items-center justify-center rounded-xl border border-blue-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-3 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          Following
        </button>
      ) : (
        <button onClick={handleFollow} className="inline-flex m-4 min-w-28  active:scale-95 h-7 whitespace-nowrap break-keep animate-shimmer items-center justify-center rounded-xl border border-blue-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-3 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          {isFollowerUser ? 'Follow Back' : 'Follow'}
        </button>
      )}</>}
      {user?.onCount && <p className='bg-green-500 rounded-full px-2'>{user.onCount}</p>}
    </div>
  );
};

export default AccountCard;
