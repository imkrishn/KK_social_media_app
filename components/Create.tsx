'use client'

import { useTheme } from 'next-themes'
import React, { useState } from 'react'
import PostFiles from './PostFiles';
import { databases, storage } from '@/app/(root)/appwrite';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';
import Swal from 'sweetalert2';

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'

const Create = ({ setInterfaceType }: { setInterfaceType: (opr: Type) => void }) => {

  const { theme } = useTheme();
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState<boolean>(false)
  const [content, setContent] = useState('');
  const { $id } = useLoggedInUser();




  function handleOnFile(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target
    setFiles(files)
  }


  async function onPost() {
    try {
      setLoading(true);

      const uploadedFilesIds: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const cloudFile = await storage.createFile(
              process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
              "unique()",
              file
            );
            uploadedFilesIds.push(cloudFile.$id);
          } catch (fileError) {
            console.error("Error uploading file:", fileError);
          }
        }

      }


      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST!,
        "unique()",
        { content, files: uploadedFilesIds, userId: $id }
      );
      console.log("Post created successfully");


    } catch (err) {
      console.error("Error in onPost:", err);
    } finally {
      setLoading(false);
      Swal.fire("Your post uploaded successfully");
      setInterfaceType("Profile");
    }
  }


  return (
    <div className='h-full w-[75%]  bg-black  rounded-xl px-11 overflow-clip p-10 relative'>
      <div className={`w-full lg:h-[60vh] rounded-sm overflow-y-auto p-4   my-2 ${theme === 'dark' ? 'bg-white bg-opacity-85 text-black' : 'bg-black text-white'}`}>
        <textarea onChange={(e) => setContent(e.target.value)} placeholder='New Post' className='w-full h-1/2 max-h-full resize-none  rounded-md outline-none border-none bg-transparent'></textarea>
        <PostFiles files={files} />
      </div>
      <div className={`absolute bottom-0 border-t-2  flex items-center gap-3 p-4 w-full left-0  ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <label className='ml-11'>
          <input onChange={handleOnFile} type='file' className='hidden' multiple />
          <svg className='h-6 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#241f31" : "#ffffff"} d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" /></svg>
        </label>
        <label>
          <input type='file' capture='environment' className='hidden' />
          <svg className='h-6 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#241f31" : "#ffffff"} d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" /></svg>
        </label>
        <button onClick={onPost} className="absolute  right-11 inline-flex  m-4 active:scale-95 h-7 animate-shimmer items-center justify-center rounded-xl border border-blue-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          {loading ? 'Posting' : 'Post'}
        </button>
      </div>
    </div>
  )
}

export default Create