'use client'

import React, { useEffect, useState } from 'react'
import AccountCard from './AccountCard'
import PostCard from './PostCard'
import { useTheme } from 'next-themes'
import { databases } from '@/app/(root)/appwrite'

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


const Posted = ({ post }: { post: Post }) => {
  const { theme } = useTheme();
  const [user, setUser] = useState();



  useEffect(() => {
    async function fetchUsers() {
      if (!post?.userId) {
        return
      }
      try {
        const person = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          post.userId!
        );

        setUser(person as any)
      } catch (Err) {
        console.error(Err);

      }
    }

    fetchUsers()
  }, [post])


  return (
    <div className={`min-h-48 rounded-lg w-full border   my-4 ${theme === 'dark' ? 'text-black bg-white' : 'text-white bg-black'}`}>
      {user && < AccountCard user={user} followBtn={true} />}
      <PostCard post={post} />
    </div>
  )
}

export default Posted