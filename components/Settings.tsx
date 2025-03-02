'use client'

import { account, databases, storage } from '@/app/(root)/appwrite';
import { RootState } from '@/redux/store';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Spinner from './ui/Spinner';
import { Query } from 'appwrite';

type User = {
  $id: string;
  fullName: string;
  userName: string;
  imageUrl: string;
  dob: string;
  email: string;
};

const Settings = ({ setSetting }: { setSetting: (opr: boolean) => void }) => {
  const [user, setUser] = useState<User>();
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [onUpdateName, setUpdateName] = useState<boolean>(false);
  const [onupdateUsername, setUpdateUsername] = useState<boolean>(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [err, setErr] = useState('')



  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        const loggedInUser = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          loggedInUserId!
        );

        if (loggedInUser) {
          setUser(loggedInUser as any)

        }
      } catch (err) {
        console.error(err);

      } finally {
        setLoading(false)
      }
    }

    if (loggedInUserId) {

      fetchUser()
    }
  }, [loggedInUserId]);


  async function onProfilePicture(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const { files } = e.target;
      setUploading(true)
      if (files && files?.length > 0) {
        const profilePicture = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          'unique()',
          files[0]
        )

        const getProfilePicture = await storage.getFileView(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          profilePicture.$id
        );

        if (user) {
          user.imageUrl = getProfilePicture;
        }

        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          loggedInUserId!,
          { imageUrl: getProfilePicture }
        );
      }
    } catch (err) {
      console.error(err);

    } finally {
      setUploading(false)
    }
  }

  async function onLogout() {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Logout!",
      });

      if (!result.isConfirmed) {
        return
      }

      await account.deleteSession('current');
      localStorage.removeItem("chat");
      window.location.reload()
    } catch (err) {
      console.error(err);

    }
  }

  async function onDelete() {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete the account?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete!",
      });

      if (!result.isConfirmed) {
        return
      }

      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        loggedInUserId!
      );

      await account.deleteSessions()
      localStorage.removeItem('chat')
      window.location.reload()

    } catch (err) {
      console.error(err);

    }
  }

  async function onNameUpdate() {
    try {
      if (!updatedName) {
        return
      }

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        loggedInUserId!,
        { fullName: updatedName }
      );
      if (user) {
        user.fullName = updatedName
      }

      setUpdateName(false);

    } catch (Err) {
      console.log(Err);

    }
  }

  async function onUsernameUpdate() {
    try {
      setErr('')

      if (!updatedUsername) {
        return
      }

      const users = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        [
          Query.equal('userName', updatedUsername)
        ]
      );

      if (users.total > 0) {
        setErr('UserName is already taken')
      } else {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          loggedInUserId,
          { userName: updatedUsername }
        );

        if (user) {
          user.userName = updatedUsername
        }
        setUpdateUsername(false)
      }



    } catch (err) {
      console.error(err);

    }
  }

  return (
    <div className='h-full z-30 w-full bg-black text-white  flex lg:flex-row flex-col items-center relative justify-center gap-11'>

      {!loading ? <><div className='relative p-3 '>
        {uploading && <p className='font-bold my-4 w-max m-auto'>Uploading ...</p>}
        {user?.imageUrl ? (
          <Image src={user.imageUrl} width={100} height={100} alt='user' className='h-56 w-56 border-black rounded-full border' />
        ) : (
          <svg className='w-32 border p-2 rounded-full ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path fill='#ffffff' d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
          </svg>
        )}

        <label className='absolute right-0 bottom-0'>
          <svg className='h-6  cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill='#ffffff' d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" /></svg>
          <input onChange={onProfilePicture} type='file' className='hidden' />
        </label>
      </div>
        <div className='w-1/2  flex flex-col justify-center h-full items-center p-5'>
          {err && <p className='text-red-500 font-bold m-auto w-max'>{err}</p>}
          <svg onClick={() => setSetting(false)} className='h-6 absolute right-4 top-4 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill='#ffffff' d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
          <div className='flex flex-col gap-5 justify-center border rounded p-5'>
            <div className='flex items-center gap-2 '>
              <pre className='text-2xl font-bold'>Name     : </pre>
              {onUpdateName ? <>
                <input onChange={(e) => setUpdatedName(e.target.value)} type='text' className='px-4 py-2 rounded-2xl outline-none' placeholder='New Name' />
                <svg className='h-8 cursor-pointer active:scale-95' onClick={onNameUpdate} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#26a269" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
              </> : <>
                <div className='px-4 py-2 rounded-2xl bg-slate-700 w-full'>{user?.fullName}</div>
                <svg onClick={() => setUpdateName(true)} className='h-8 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill='#ffffff' d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" /></svg>
              </>}

            </div>
            <div className='flex items-center gap-2'>
              <pre className='text-2xl font-bold'>Username : </pre>
              {onupdateUsername ? <>
                <input type='text' onChange={(e) => setUpdatedUsername(e.target.value)} placeholder='New UserName' className='px-4 py-2 rounded-2xl outline-none' />
                <svg className='h-8 cursor-pointer active:scale-95' onClick={onUsernameUpdate} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#26a269" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
              </> : <>
                <div className='px-4 py-2 rounded-2xl bg-slate-700 w-full'>{user?.userName}</div>
                <svg onClick={() => setUpdateUsername(true)} className='h-8 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill='#ffffff' d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" /></svg>
              </>}

            </div>

            <div className='flex items-center gap-2'>
              <pre className='text-2xl font-bold'>Email    : </pre>
              <div className='px-4 py-2 rounded-2xl bg-slate-700 w-full' >{user?.email}</div>

            </div>
            <div className='flex items-center gap-2'>
              <pre className='text-2xl font-bold'>D.O.B.   : </pre>
              <div className='px-4 py-2 rounded-2xl bg-slate-700 w-full' >{user?.dob.slice(0, 10)}</div>
            </div>
          </div>
          <div className='flex items-center gap-11 my-5 '>
            <button onClick={onLogout} type='reset' className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Logout
              </span>
            </button>
            <button onClick={onDelete} type='submit' className="px-8 py-2 rounded-md bg-red-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500">
              Delete Account
            </button>
          </div>
        </div>
      </> : <Spinner size={50} />}
    </div>
  )
}

export default Settings