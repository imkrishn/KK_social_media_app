'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import PostFiles from './PostFiles';
import { databases } from '@/app/(root)/appwrite';
import { Query } from 'appwrite';
import Comment from './Comment';


interface StoredFile {
  $id: string;
  name?: string;
  fileHref: string;
  mimeType: string;
}

interface Post {
  $id: string;
  content?: string;
  userId?: string;
  files?: StoredFile[];
  likes?: number;
  loves?: number;
  savedIds?: string[]
  $createdAt: string;

}

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'

const PostCard = ({ post, onDeletePost, setInterfaceType }: { post: Post, onDeletePost?: (id: string) => void, setInterfaceType?: (opr: Type) => void }) => {
  const { theme } = useTheme()
  const [like, setLike] = useState<boolean>(false);
  const [love, setLove] = useState<boolean>(false);
  const [isLikeId, setIsLikeId] = useState<string>('');
  const [isLoveId, setIsLoveId] = useState<string>('');
  const [isMenu, setIsMenu] = useState<boolean>(false)
  const [comments, setComments] = useState([]);
  const [textComment, setTextComment] = useState('')
  const [likeCount, setLikeCount] = useState<undefined | number>(0);
  const [loveCount, setLoveCount] = useState<number | undefined>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [commentIcon, setCommentIcon] = useState<boolean>(false);
  const [reply, setReply] = useState(false);
  const [replyText, setReplyText] = useState('')



  const loggedInUser = useSelector((state: RootState) => state.loggedInUser)
  const loggedInUserId = loggedInUser?.$id;



  function formatDate(time: string): string {
    const date = new Date(time);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  }


  useEffect(() => {
    async function fetchpostDetails() {
      try {
        setLoading(true)
        const isLiked = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LIKES!,
          [
            Query.equal('userId', loggedInUserId),
            Query.equal('postId', post.$id)
          ]
        )

        const isLoved = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOVES!,
          [
            Query.equal('userId', loggedInUserId),
            Query.equal('postId', post.$id)
          ]
        );

        const totalLikes = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LIKES!,
          [
            Query.equal('postId', post.$id)
          ]
        );

        const totalLoves = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOVES!,
          [
            Query.equal('postId', post.$id)
          ]
        );

        setLikeCount(totalLikes.total);
        setLoveCount(totalLoves.total)


        if (isLiked.total > 0) {
          setIsLikeId(isLiked.documents[0].$id)
        }

        if (isLoved.total > 0) {
          setIsLoveId(isLoved.documents[0].$id)
        }

        setLove(isLoved.total > 0)
        setLike(isLiked.total > 0)

      } catch (Err) {
        console.error(Err);

      } finally {
        setLoading(false)
      }
    }

    fetchpostDetails()

  }, [post])

  //fetch comments of post


  async function fetchComments() {
    try {
      setCommentIcon((prev) => !prev)

      if (commentIcon) {
        return
      }

      const commentss = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS!,
        [
          Query.orderDesc('$createdAt'),
          Query.equal('postId', post.$id)
        ]
      );
      console.log(commentss);

      setComments(commentss.documents as any)
    } catch (err) {
      console.error(err);

    }
  }


  async function onLikeclick() {

    if (!like) {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LIKES!,
        'unique()',
        { userId: loggedInUserId, postId: post.$id }
      )

      setLikeCount((prev) => prev as number + 1)

    } else {

      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LIKES!,
        isLikeId,

      )

      setLikeCount((prev) => prev as number - 1)
    }

    setLike((prev) => !prev);

  }

  async function onLoveClick() {
    if (!love) {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOVES!,
        'unique()',
        { userId: loggedInUserId, postId: post.$id }
      )
      setLoveCount((prev) => prev as number + 1)

    } else {

      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOVES!,
        isLoveId,

      )

      setLoveCount((prev) => prev as number - 1)
    }

    setLove((prev) => !prev);

  }


  async function onDelete() {

    if (onDeletePost) await onDeletePost(post.$id);
    setIsMenu(false)
  }

  async function onComment() {
    try {

      if (!textComment || !loggedInUserId || !loggedInUser) {
        return
      }

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS!,
        'unique()',
        {
          userId: loggedInUserId,
          userName: loggedInUser?.fullName,
          content: textComment,
          imageURL: loggedInUser?.imageURL,
          postId: post?.$id
        }
      )

      setComments((prev) => [{
        userId: loggedInUserId,
        userName: loggedInUser?.fullName,
        content: textComment,
        imageURL: loggedInUser?.imageURL,
        postId: post?.$id
      }, ...prev] as any)

    } catch (err) {
      console.error(err);

    }

    setTextComment('')
  }



  return (
    <div key={post.$id} className={`border w-full rounded   p-3 ${theme === 'dark' ? 'bg-opacity-70 text-black' : 'bg-opacity-55 text-white'}`}>

      <div className='flex items-center gap-2 my-3 w-full text-blue-600'>
        <p className='text-xs font-extralight whitespace-nowrap break-keep'>{formatDate(post?.$createdAt)}</p>
        <svg className='h-2' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M57.7 193l9.4 16.4c8.3 14.5 21.9 25.2 38 29.8L163 255.7c17.2 4.9 29 20.6 29 38.5l0 39.9c0 11 6.2 21 16 25.9s16 14.9 16 25.9l0 39c0 15.6 14.9 26.9 29.9 22.6c16.1-4.6 28.6-17.5 32.7-33.8l2.8-11.2c4.2-16.9 15.2-31.4 30.3-40l8.1-4.6c15-8.5 24.2-24.5 24.2-41.7l0-8.3c0-12.7-5.1-24.9-14.1-33.9l-3.9-3.9c-9-9-21.2-14.1-33.9-14.1L257 256c-11.1 0-22.1-2.9-31.8-8.4l-34.5-19.7c-4.3-2.5-7.6-6.5-9.2-11.2c-3.2-9.6 1.1-20 10.2-24.5l5.9-3c6.6-3.3 14.3-3.9 21.3-1.5l23.2 7.7c8.2 2.7 17.2-.4 21.9-7.5c4.7-7 4.2-16.3-1.2-22.8l-13.6-16.3c-10-12-9.9-29.5 .3-41.3l15.7-18.3c8.8-10.3 10.2-25 3.5-36.7l-2.4-4.2c-3.5-.2-6.9-.3-10.4-.3C163.1 48 84.4 108.9 57.7 193zM464 256c0-36.8-9.6-71.4-26.4-101.5L412 164.8c-15.7 6.3-23.8 23.8-18.5 39.8l16.9 50.7c3.5 10.4 12 18.3 22.6 20.9l29.1 7.3c1.2-9 1.8-18.2 1.8-27.5zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" /></svg>
        {post.userId === loggedInUserId && <div className='w-full relative'>
          <svg onClick={() => setIsMenu((prev) => !prev)} className='right-0 absolute h-4 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" /></svg>
          {isMenu && <p onClick={onDelete} className='absolute right-3 bg-black bg-opacity-70  select-none  text-red-500 rounded-lg px-3 py-1 cursor-pointer active:scale-95'>Delete</p>}
        </div>}
      </div>
      <div className='py-2 break-words max-h-48 overflow-y-auto'>
        {post.content}
        <PostFiles files={post.files} />
      </div>

      {!loading && <div className='border-t-2 py-2 flex gap-5 relative'>
        <div className='flex gap-2 items-center'>
          <p>{likeCount}</p>
          {!like ?
            <svg onClick={onLikeclick} className='h-5 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M323.8 34.8c-38.2-10.9-78.1 11.2-89 49.4l-5.7 20c-3.7 13-10.4 25-19.5 35l-51.3 56.4c-8.9 9.8-8.2 25 1.6 33.9s25 8.2 33.9-1.6l51.3-56.4c14.1-15.5 24.4-34 30.1-54.1l5.7-20c3.6-12.7 16.9-20.1 29.7-16.5s20.1 16.9 16.5 29.7l-5.7 20c-5.7 19.9-14.7 38.7-26.6 55.5c-5.2 7.3-5.8 16.9-1.7 24.9s12.3 13 21.3 13L448 224c8.8 0 16 7.2 16 16c0 6.8-4.3 12.7-10.4 15c-7.4 2.8-13 9-14.9 16.7s.1 15.8 5.3 21.7c2.5 2.8 4 6.5 4 10.6c0 7.8-5.6 14.3-13 15.7c-8.2 1.6-15.1 7.3-18 15.2s-1.6 16.7 3.6 23.3c2.1 2.7 3.4 6.1 3.4 9.9c0 6.7-4.2 12.6-10.2 14.9c-11.5 4.5-17.7 16.9-14.4 28.8c.4 1.3 .6 2.8 .6 4.3c0 8.8-7.2 16-16 16l-97.5 0c-12.6 0-25-3.7-35.5-10.7l-61.7-41.1c-11-7.4-25.9-4.4-33.3 6.7s-4.4 25.9 6.7 33.3l61.7 41.1c18.4 12.3 40 18.8 62.1 18.8l97.5 0c34.7 0 62.9-27.6 64-62c14.6-11.7 24-29.7 24-50c0-4.5-.5-8.8-1.3-13c15.4-11.7 25.3-30.2 25.3-51c0-6.5-1-12.8-2.8-18.7C504.8 273.7 512 257.7 512 240c0-35.3-28.6-64-64-64l-92.3 0c4.7-10.4 8.7-21.2 11.8-32.2l5.7-20c10.9-38.2-11.2-78.1-49.4-89zM32 192c-17.7 0-32 14.3-32 32L0 448c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32l-64 0z" /></svg>
            :
            <svg onClick={onLikeclick} className='h-5 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2l144 0c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48l-97.5 0c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3l0-38.3 0-48 0-24.9c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192l64 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32L0 224c0-17.7 14.3-32 32-32z" /></svg>}
        </div>
        <div className='flex gap-2 items-center'>
          <p>{loveCount}</p>
          {!love ?
            <svg className='h-5 cursor-pointer active:scale-95' onClick={onLoveClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" /></svg>
            : <svg className='h-5 cursor-pointer active:scale-95' onClick={onLoveClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#e01b24" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg>
          }
        </div>
        <div className='flex gap-2 absolute right-4 items-center'>
          <p>{comments.length !== 0 && comments.length}</p>
          <svg onClick={fetchComments} className='h-5 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9l.3-.5z" /></svg>
        </div>
      </div>}

      {commentIcon && <div className='relative h-60 bg-opacity-75'>
        <div className='h-48 overflow-y-auto mb-11'>
          {
            comments.map((comment: any) => (
              <Comment key={comment.$id} comment={comment} setInterfaceType={setInterfaceType} setReply={setReply} reply={reply} />
            ))
          }
          {comments.length === 0 && <p className=' font-extralight w-max m-auto text-gray-500'>No Comments</p>}
        </div>

        {!reply ? <div className={`flex gap-2  absolute -bottom-2 bg-opacity-90 items-center w-full px-8  py-2 rounded ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <textarea value={textComment} onChange={(e) => setTextComment(e.target.value)} className='w-full resize-none  bg-transparent outline-none  ' placeholder='Comment here' />
          <svg onClick={onComment} className='h-5 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#2ec27e" d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" /></svg>
        </div> :
          <div className={`flex gap-2  absolute -bottom-2 bg-opacity-90 items-center w-full px-8  py-2 rounded ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className='w-full resize-none  bg-transparent outline-none  ' placeholder='Reply here' />
            <svg className='h-5 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#2ec27e" d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" /></svg>
          </div>
        }
      </div>}
    </div>
  )
}

export default PostCard