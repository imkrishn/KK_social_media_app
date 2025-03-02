'use client'

import React, { useEffect, useRef, useState } from 'react'
import AccountCard from './AccountCard'
import { useTheme } from 'next-themes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import MessageBox from './MessageBox';
import { client, databases } from '@/app/(root)/appwrite';
import { setNotification } from '@/redux/slices/notification';

type User = {
  $id: string;
  fullName?: string;
  userName?: string;
  imageURL?: string;
  dob?: string;
  onCount?: number
}


const Messages = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [theUsers, setTheUsers] = useState<User[]>(() => {
    const storedChats = localStorage.getItem('chat');
    return storedChats ? JSON.parse(storedChats) : [];
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User>();
  const currentMsgUser = useSelector((state: RootState) => state.currentMsgUser);
  const recieverId = useSelector((state: RootState) => state.currentMsgUser.$id);


  useEffect(() => {
    async function fetchUser() {
      const reciever = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        recieverId!
      );

      if (reciever) {
        setUser(reciever)

        setTheUsers((prev) => {
          if (prev.some((user) => user.$id === recieverId)) {
            return prev;
          }
          const finalUsers = [reciever, ...prev]
          localStorage.setItem('chat', JSON.stringify(finalUsers))
          return finalUsers;
        });

      }
    }

    if (recieverId) {

      fetchUser()
    }
  }, [recieverId])

  function onSearch(query: string) {
    if (query) {
      const updatedChats = theUsers.filter((user) => user.fullName?.toLowerCase()?.startsWith(query.toLowerCase()));
      setTheUsers(updatedChats)
    } else {
      const updatedChats = localStorage.getItem('chat');
      const chats = updatedChats ? JSON.parse(updatedChats) : []
      setTheUsers(chats)
    }
  }

  useEffect(() => {
    try {
      const unsubscribe = client.subscribe(
        `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!}.documents`,
        async (response: any) => {
          if (response.events.some((event: string) => event.includes("documents.*.create"))) {
            setTheUsers((prevUsers) =>
              prevUsers.map((theUser) =>
                theUser.$id === response.payload?.senderId
                  ? { ...theUser, onCount: (theUser?.onCount ?? 0) + 1 }
                  : theUser
              )
            );

            localStorage.setItem('chat', JSON.stringify(theUsers))


          }
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error("Error in notification:", err);
    }
  }, [setTheUsers]);

  useEffect(() => {
    const notificationCount = theUsers.reduce((acc, value) => acc + (value?.onCount ?? 0), 0);
    dispatch(setNotification(notificationCount));

  }, [theUsers])



  return (
    <>
      {!currentMsgUser.isFlag ? <div className='h-full w-[75%] bg-black rounded-xl px-11 p-4 overflow-y-auto'>

        <div className='flex items-center justify-center m-auto w-full bg-slate-900 text-white rounded-2xl gap-1'>
          <input onChange={(e) => onSearch(e.target.value)} type='text' placeholder='Search Chats' className='outline-none px-3 py-1 w-full rounded-md bg-transparent' />
        </div>
        <div ref={loadMoreRef} className={`h-full  overflow-y-auto rounded-lg my-3   p-4 ${theme === 'dark' ? 'bg-slate-200 bg-opacity-75 text-black' : 'bg-black text-white'}`}>
          {
            theUsers.map((user: User) => (
              <AccountCard key={user.$id} user={user} chat={true} />
            ))
          }

          {theUsers.length === 0 && <div className='flex justify-center items-center h-full'>
            <p className='text-gray-600'>No Chats History</p>
          </div>}
        </div>
      </div> : <MessageBox user={user} />}
    </>
  )
}

export default Messages