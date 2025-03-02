import { useState, useEffect } from "react";
import { account, databases } from "@/app/(root)/appwrite";
import { Query } from "appwrite";

interface User {
  $id: string;
  fullName: string;
  dob: string;
  email: string;
  userName: string;
  imageUrl: string
}

export function useLoggedInUser() {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const loggedInUser = await account.get();
        const { email } = loggedInUser

        const theUser = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          [
            Query.equal('email', email)
          ]
        );

        if (theUser.total > 0) {
          const { fullName, dob, email, $id, userName, imageUrl } = theUser.documents[0]
          setUser({ fullName, dob, email, $id, userName, imageUrl })
        }

      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { ...user, loading, error };
}
