import { databases } from "@/app/(root)/appwrite";
import { Query } from "appwrite";


export async function onFollow(userId: string, loggedInUserId: string) {
  try {
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
      'unique()',
      {
        followerId: loggedInUserId,
        followingId: userId,
        users: loggedInUserId
      }
    );

    console.log(`User followed  successfully`);
  } catch (err) {
    console.error("Error following user:", err);
  }
}

export async function onUnfollow(userId: string, loggedInUserId: string) {
  try {

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
      [
        Query.equal("followerId", loggedInUserId),
        Query.equal("followingId", userId)
      ]
    );

    if (response.documents.length > 0) {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
        response.documents[0].$id
      );

      console.log(`User  unfollowed successfully`);
    }
  } catch (err) {
    console.error("Error unfollowing user:", err);
  }
}

export async function isFollowing(userId: string, loggedInUserId: string): Promise<boolean> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
      [
        Query.equal("followerId", loggedInUserId),
        Query.equal("followingId", userId)
      ]
    );

    return response.total > 0



  } catch (err) {
    console.error("Error unfollowing user:", err);
    return false
  }
}

export async function isFollower(userId: string, loggedInUserId: string): Promise<boolean> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FOLLOWER!,
      [
        Query.equal("followerId", userId),
        Query.equal("followingId", loggedInUserId)
      ]
    );

    return response.total > 0



  } catch (err) {
    console.error("Error unfollowing user:", err);
    return false
  }
}