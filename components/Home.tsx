'use client'

import React, { useEffect, useState } from 'react';
import { databases, storage } from '@/app/(root)/appwrite';
import { Query } from 'appwrite';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Posted from './Post';
import Spinner from './ui/Spinner';
import { motion } from 'framer-motion'

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
  savedIds?: string[];
  $createdAt: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id);

  async function fetchPosts(currentPage = 0) {
    if (!loggedInUserId || loading || !hasMore) return;

    setLoading(true);

    try {
      // Fetch followings
      const followings = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
        [Query.equal('followerId', loggedInUserId)]
      );

      const followingIds = followings.documents.map((following) => following.followingId);

      let storedPosts;

      if (followingIds.length > 0) {
        // Fetch posts from followings
        storedPosts = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST!,
          [
            Query.orderDesc('$createdAt'),
            Query.equal('userId', followingIds),
            Query.limit(3),
            Query.offset(currentPage * 3),
          ]
        );
      } else {
        // Fetch random posts if no followings
        storedPosts = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST!,
          [
            Query.orderDesc('$createdAt'),
            Query.limit(3),
            Query.offset(currentPage * 3),
          ]
        );
      }

      if (storedPosts.documents.length < 3) {
        setHasMore(false);
      }

      // Fetch file details for each post
      const finalPosts = await Promise.all(
        storedPosts.documents.map(async (post) => {
          if (!post.files) return post;
          const files = await Promise.all(
            post.files.map(async (fileId: string) => {
              const file = await storage.getFile(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                fileId
              );

              const fileHref = await storage.getFileView(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                fileId
              );
              return { ...file, fileHref };
            })
          );
          return { ...post, files };
        })
      );

      // Prevent duplicates
      setPosts((prev) => {
        const uniquePosts = new Map(prev.map((p) => [p.$id, p]));
        finalPosts.forEach((post) => uniquePosts.set(post.$id, post));
        return Array.from(uniquePosts.values());
      });

      setPage(currentPage + 1);
    } catch (Err) {
      console.error('Error fetching posts:', Err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    fetchPosts(0);
  }, [loggedInUserId]);

  return (
    <div className='h-full w-[75%] bg-black rounded-xl px-11 overflow-y-auto'>
      <p className='text-3xl font-extralight my-3'>Top Posts</p>
      <div className='flex items-center justify-evenly flex-wrap'>
        {posts.map((post) => (
          <motion.div
            key={post.$id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
          >
            <Posted key={post.$id} post={post} />
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => fetchPosts(page)}
          disabled={loading}
          className="w-full py-2 mt-4 text-center text-white bg-gray-700 rounded hover:bg-gray-600"
        >
          {loading ? <Spinner size={20} /> : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default Home;
