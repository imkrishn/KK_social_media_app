'use client'

import React, { useEffect, useRef, useState } from 'react'
import AccountCard from './AccountCard'
import { useTheme } from 'next-themes'
import { useFetchUsers } from '@/hooks/useFetchUsers'
import Spinner from './ui/Spinner'
import { databases } from '@/app/(root)/appwrite'
import { Query } from 'appwrite'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import Profile from './Profile'


type User = {
  $id: string;
  fullName?: string;
  userName?: string;
  imageURL?: string;
  dob?: string;

}

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'


const Explore = ({ setInterfaceType }: { setInterfaceType: (opr: Type) => void }) => {

  const { theme } = useTheme();
  const { users, hasMore, loading, fetchMoreUsers } = useFetchUsers();
  const [theUsers, setTheUsers] = useState<User[]>([])
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profileInterface, setProfileInterface] = useState<boolean>(false)
  const userId = useSelector((state: RootState) => state.currentViewingUserId.$id);


  useEffect(() => {
    setTheUsers(users)
  }, [users])

  useEffect(() => {
    if (userId) {
      setProfileInterface(true)
    }
  }, [userId])


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreUsers();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchMoreUsers, hasMore]);


  async function onSearch(query: string) {
    try {
      if (searchQuery.trim() === '') {
        const user = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        );

        setTheUsers(user.documents)
      } else {

        const user = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          [Query.search('fullName', query)]
        );
        setTheUsers(user.documents)
      }

    } catch (err) {
      console.error(err);

    }
  }

  useEffect(() => {
    onSearch(searchQuery)

  }, [searchQuery])

  return (
    <>
      {!profileInterface ? <div className='bg-black  h-full w-[75%]  rounded-xl px-11   overflow-y-hidden'>
        <p className='text-3xl my-3 font-extralight text-blue-600'>Top Results</p>
        <div className='flex items-center justify-center m-auto w-full bg-slate-900 text-white rounded-2xl gap-1'>
          <input onChange={(e) => setSearchQuery(e.target.value)} type='text' placeholder='Get Your Desire' className='outline-none px-3 py-1 w-full rounded-md bg-transparent' />
          <p onClick={() => onSearch(searchQuery)} className='text-3xl px-2 cursor-pointer active:scale-95 select-none'>⌕</p>
        </div>
        <div ref={loadMoreRef} className={`h-[50vh]  overflow-y-auto rounded-lg my-3   p-4 ${theme === 'dark' ? 'bg-slate-200 bg-opacity-75 text-black' : 'bg-black text-white'}`}>
          {
            theUsers.map((user: User) => (
              <AccountCard key={user.$id} user={user} followBtn={true} />
            ))
          }
          {loading && <div className='flex justify-center items-center h-full'>
            <Spinner size={30} />
          </div>}
          {theUsers.length === 0 && !loading && <div className='flex justify-center items-center h-full'>
            <p className='text-gray-600'>No User Found</p>
          </div>}
        </div>
      </div>
        : <Profile id={userId} setProfileInterface={setProfileInterface} setInterfaceType={setInterfaceType} />
      }
    </>
  )
}

export default Explore