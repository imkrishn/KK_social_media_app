'use client'

import React, { useEffect, useState } from 'react'
import AccountCard from './AccountCard'
import { databases } from '@/app/(root)/appwrite';
import { Query } from 'appwrite';
import Spinner from './ui/Spinner';
import { useTheme } from 'next-themes';

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'

type User = {
  $id: string;
  fullName: string;
  userName?: string;
  imageURL?: string;

}

const Follower = ({ ids, setInterfaceType }: { ids: string[], setInterfaceType?: (opr: Type) => void }) => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [backupUsers, setBackupUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('')



  useEffect(() => {

    async function fetchUsers() {
      try {
        setLoading(true)
        const theUsers = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          [
            Query.equal('$id', ids)
          ]
        );


        if (theUsers) {
          setUsers(theUsers.documents as any);
          setBackupUsers(theUsers.documents as any)
        }
      } catch (Err) {
        console.log(Err);

      } finally {
        setLoading(false)
      }
    }

    if (ids.length > 0) {
      fetchUsers()
    }
  }, [ids]);

  useEffect(() => {
    if (searchQuery === '') {
      setUsers(backupUsers);
      return;
    }

    const updatedUsers = backupUsers.filter((user: User) =>
      user.fullName.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    setUsers(updatedUsers);
  }, [searchQuery, backupUsers]);

  function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value.trim());
  }

  return (
    <div key={Date.now()} className={`w-full p-4 rounded h-full overflow-y-auto flex flex-col items-center bg-opacity-75 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}>

      <div className='flex items-center justify-center  w-full bg-slate-900 text-white rounded-2xl gap-1'>
        <input onChange={onSearch} type='text' placeholder='Get Your Peoples' className='outline-none px-3 py-1 w-full rounded-md bg-transparent' />
        <p className='text-3xl px-2 cursor-pointer active:scale-95 select-none'>⌕</p>
      </div>

      {users.map((user: User) => (
        <AccountCard key={user.$id} user={user} setInterfaceType={setInterfaceType} interfaceType='Explore' />
      ))}
      {!loading && users.length === 0 && <p className='font-extralight text-gray-400 my-4'>No users Found</p>}
      {loading && <Spinner size={30} />}
    </div>
  )
}

export default Follower