import { databases } from "@/app/(root)/appwrite";
import { RootState } from "@/redux/store";
import { Query } from "appwrite";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const LIMIT = 10;

export function useFetchUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id)

  async function fetchMoreUsers() {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        [
          Query.offset(page * LIMIT),
          Query.limit(LIMIT),
        ]
      );

      // Remove duplicates 

      setUsers((prev) => {
        const existingIds = new Set(prev.map((user) => user.$id));
        const newUsers = response.documents.filter((user) => !existingIds.has(user.$id));
        const finalIds = newUsers.filter((user) => user.$id !== loggedInUserId)
        return [...prev, ...finalIds];
      });

      // If fewer users are returned than LIMIT, we know there's no more data
      if (response.documents.length < LIMIT) setHasMore(false);

      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMoreUsers();
  }, []);

  return { users, loading, hasMore, fetchMoreUsers };
}
