'use client'

import { databases } from '@/app/(root)/appwrite';
import { setCurrentViewingUserId } from '@/redux/slices/currentViewingUser';
import { AppDispatch, RootState } from '@/redux/store';
import { useTheme } from 'next-themes'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

interface Comment {
  $id: string;
  userId: string;
  userName: string;
  content: string;
  reply: string[];
  imageURL: string;
}

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'

const Comment = ({ comment, setInterfaceType, setReply, reply }: { comment?: Comment, setInterfaceType?: (opr: Type) => void, setReply: (opr: any) => void, reply: boolean }) => {

  const { theme } = useTheme();
  const [love, setLove] = useState(false);
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id)
  const dispatch = useDispatch<AppDispatch>();

  async function onLikeClick() {
    try {

      if (!comment?.$id) {
        return
      }

      const theComment = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS!,
        comment.$id
      );

      if (theComment) {
        const isLiked = theComment.likes.some((id: string) => id === loggedInUserId)
        const updatedLikes = isLiked ? theComment.likes.filter((id: string) => id !== loggedInUserId) : [...theComment.likes, loggedInUserId]
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS!,
          comment.$id,
          { likes: updatedLikes }
        )
      }

      setLove((prev => !prev));
    } catch (err) {
      console.error(err);

    }
  }

  useEffect(() => {
    async function fetchLikes() {
      try {
        if (!loggedInUserId || !comment?.$id) {
          return;
        }

        const theComment = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS!,
          comment.$id
        );

        if (theComment) {
          const isLiked = theComment.likes.some((id: string) => id === loggedInUserId);
          setLove(isLiked);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchLikes();
  }, [loggedInUserId, comment?.$id]);



  function dispatchId() {
    if (setInterfaceType) setInterfaceType('Explore')


    if (comment?.userId) dispatch(setCurrentViewingUserId({ $id: comment?.userId }));

  }


  return (
    <div key={comment?.$id} className='p-4 my-3 shadow-lg '>
      <div className='flex gap-6 items-center shadow-sm p-2 select-none cursor-pointer ' onClick={dispatchId}>
        {comment?.imageURL ? (
          <Image src={comment?.imageURL} alt='user' className='h-5 w-5 border-black rounded-full border' />
        ) : (
          <svg className='w-6 border rounded-full p-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
          </svg>
        )}

        <p className='text-green-700 font-bold font-mono'>~ {comment?.userName}</p>
      </div>
      <p className='text-sm my-2 ml-4'>{comment?.content}</p>
      <div className='flex items-center my-3 gap-4 select-none'>
        <hr />
        {!love ?
          <svg onClick={onLikeClick} className='h-3 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" /></svg>
          : <svg onClick={onLikeClick} className='h-3 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#e01b24" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg>
        }
        <p onClick={() => setReply((prev: boolean) => !prev)} className='text-xs cursor-pointer active:scale-95'>Reply</p>
        {reply && <div>
          {comment?.reply.map((answer) => (
            <p key={Math.random()} className='ml-11 text-xs'>{answer}</p>
          ))}
        </div>}
      </div>
    </div>
  )
}

export default Comment