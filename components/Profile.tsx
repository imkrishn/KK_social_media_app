'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import PostCard from './PostCard'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { useTheme } from 'next-themes'
import { databases, storage } from '@/app/(root)/appwrite'
import Spinner from './ui/Spinner'
import { isFollower, isFollowing, onFollow, onUnfollow } from '@/lib/onFollowUnfollow'
import Swal from 'sweetalert2'
import { Query } from 'appwrite'
import Follower from './Follower'
import { setCurrentMsgUser } from '@/redux/slices/currentMsgUser'
import { motion } from 'framer-motion'

type User = {
  $id: string;
  fullName?: string;
  userName?: string;
  imageUrl?: string;
  dob?: string;

}

interface StoredFile {
  $id: string;
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
  $createdAt: string;
}

type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile'


const Profile = ({ id, setProfileInterface, setInterfaceType }: { id: string, setProfileInterface?: (opr: boolean) => void, setInterfaceType?: (opr: Type) => void }) => {
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id);
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>()
  const [user, setUser] = useState<User>();
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [postsLoading, setPostLoading] = useState<boolean>(false)
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);
  const [isFollowerUser, setIsFollowerUser] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>();
  const [followersIds, setFollowersIds] = useState([]);
  const [onFollowerClick, setOnFollowerClick] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number | undefined>();
  const [followingCount, setFollowingCount] = useState<number | undefined>();



  //follow and unfollow functionality

  useEffect(() => {
    async function fetchData() {
      const resFollowing = await isFollowing(id, loggedInUserId);
      const resFollower = await isFollower(id, loggedInUserId);
      setIsFollowingUser(resFollowing);
      setIsFollowerUser(resFollower);
    }

    async function fetchFollowingsCount() {
      try {
        const followings = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
          [
            Query.equal('followerId', id)
          ]
        );

        setFollowingCount(followings.total)
      } catch (err) {
        console.error(err);

      }
    }

    async function fetchFollowersCount() {
      try {
        const followers = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
          [
            Query.equal('followingId', id)
          ]
        );

        setFollowerCount(followers.total)
      } catch (err) {
        console.error(err);

      }
    }

    if (id && loggedInUserId) {
      fetchFollowersCount()
      fetchFollowingsCount()
      fetchData();
    }
  }, [id, loggedInUserId]);


  const handleFollow = async () => {
    await onFollow(id, loggedInUserId);
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

    await onUnfollow(id, loggedInUserId);
    setIsFollowingUser(false);
  };

  //fetch current user

  useEffect(() => {
    async function fetchUser() {
      try {
        setUserLoading(true)
        const user = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          id
        );


        setUser(user)
      } catch (Err) {
        console.error(Err);

      } finally {
        setUserLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  //fetch current user's posts

  useEffect(() => {
    async function fetchAllPosts() {
      try {
        setPostLoading(true)
        const storedPosts = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST!,
          [
            Query.orderDesc('$createdAt'),
            Query.equal('userId', id)
          ]
        );

        const finalPosts = await Promise.all(
          storedPosts.documents.map(async (post) => {
            const files = await Promise.all(
              post.files.map(async (fileId: string) => {
                const file = await storage.getFile(
                  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                  fileId
                );

                const fileHref = await storage.getFileView(
                  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                  fileId
                )
                return { ...file, fileHref };
              })
            );




            return { ...post, files };
          })
        );

        setPosts(finalPosts)



      } catch (Err) {
        console.log(Err);

      } finally {
        setPostLoading(false)
      }
    }

    fetchAllPosts()
  }, [])

  //ondelete post

  async function onDeletePost(id: string) {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this post?",
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
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST!,
        id
      );

      const updatedPosts = posts?.filter((post) => post.$id !== id)
      setPosts(updatedPosts)
    } catch (err) {
      console.error(err);

    }
  }

  //get all followers

  async function getFollowers() {
    try {


      const followers = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
        [
          Query.equal('followingId', id)
        ]
      );

      const followersIds = followers.documents.map((follower) => follower.followerId);

      setFollowersIds(followersIds as any);
      setFollowerCount(followers.total)

    } catch (Err) {
      console.error(Err);

    } finally {
      setOnFollowerClick(true);
    }
  }

  //get all followings

  async function getFollowings() {
    try {

      const followings = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
        [
          Query.equal('followerId', id)
        ]
      );

      const followingIds = followings.documents.map((following) => following.followingId);

      setFollowersIds(followingIds as any);
      setFollowingCount(followings.total)

    } catch (Err) {
      console.error(Err);

    } finally {
      setOnFollowerClick(true);

    }
  }

  //dispatch to message

  function dispatcUser() {
    dispatch(setCurrentMsgUser({ $id: id, isFlag: true }));
    if (setInterfaceType) setInterfaceType('Messages')
  }

  return (
    <div className={`h-full w-[75%]    rounded-xl px-11 overflow-y-auto p-4 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white bg-opacity-30'}`}>
      {id !== loggedInUserId && setProfileInterface && <svg onClick={() => setProfileInterface(false)} className='h-6 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>}
      {!userLoading ? <div className=' p-4 flex border-b-2  items-center'>
        {user?.imageUrl ? (
          <Image src={user.imageUrl} alt='user' width={100} height={100} className='h-24 w-24  rounded-full border' />
        ) : (
          <svg className='h-20 border rounded-full p-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
          </svg>
        )}
        <div className='w-full'>
          <div className='flex'>
            <div className='ml-11'>
              <p className='text-2xl font-bold'>{user?.fullName}</p>
              <p className='text-sm font-extralight ml-4'>{user?.userName}</p>
            </div>
            {id !== loggedInUserId && <div className='flex gap-5 items-center'>
              <button onClick={dispatcUser} className="inline-flex ml-16 active:scale-95 h-7 animate-shimmer items-center justify-center rounded-xl border border-blue-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                Message
              </button>
              {isFollowingUser ? (
                <button onClick={handleUnfollow} className="inline-flex m-4 min-w-28 active:scale-95 h-7 animate-shimmer items-center justify-center rounded-xl border border-blue-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-3 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                  Following
                </button>
              ) : (
                <button onClick={handleFollow} className="inline-flex m-4 min-w-28  active:scale-95 h-7 whitespace-nowrap break-keep animate-shimmer items-center justify-center rounded-xl border border-blue-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-3 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                  {isFollowerUser ? 'Follow Back' : 'Follow'}
                </button>
              )}
            </div>}
          </div>
          <div className='flex justify-evenly my-3'>
            <div onClick={() => setOnFollowerClick(false)} className='cursor-pointer active:scale-95'>
              <p>posts</p>
              <p className='m-auto w-max'>{posts?.length}</p>
            </div>
            <div onClick={getFollowers} className='cursor-pointer active:scale-95'>
              <p>followers</p>
              <p className='m-auto w-max'>{followerCount}</p>
            </div>
            <div onClick={getFollowings} className='cursor-pointer active:scale-95'>
              <p>followings</p>
              <p className='m-auto w-max'>{followingCount}</p>
            </div>
          </div>
        </div>
      </div> :
        <div className='flex justify-center items-center h-full'>
          <Spinner size={30} />
        </div>}
      {onFollowerClick ? <Follower ids={followersIds} setInterfaceType={setInterfaceType} /> : <div className=' p-4   text-black  gap-4 flex flex-col '>
        {posts?.map((post) => (
          <motion.div
            key={post.$id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
          >
            <PostCard post={post} key={post.$id} onDeletePost={onDeletePost} setInterfaceType={setInterfaceType} />
          </motion.div>
        ))}
        {postsLoading && <div className='flex justify-center items-center h-full'>
          <Spinner size={20} />
        </div>}
        {posts?.length === 0 && <div className='flex justify-center items-center w-full'>
          <p className='font-extralight select-none text-gray-500 text-2xl '>No Posts yet</p>
        </div>}
      </div>}


    </div>
  )
}

export default Profile