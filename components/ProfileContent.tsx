'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IUserLimited } from "@/mongodb/models/user";
import PostOptions from "./PostOptions";
import mongoose from "mongoose";
import { IPostDocument } from "@/mongodb/models/post";
import SecureImage from "./SecureImage";

interface IProfile {
  userId: IUserLimited["userId"];
  userImage: string;
  firstName: string;
  lastName: string;
  postCount: number;
  commentCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface IPost extends Omit<IPostDocument, "_id"> {
  _id: mongoose.Types.ObjectId;
  text: string;
  imageUrl?: string;
  user: IUserLimited;
}

export default function ProfilePage({ userId }: { userId: IUserLimited["userId"] }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean | null>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchUserProfile(userId);
      fetchUserPosts(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user-profile?user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        setIsFollowing(data.isFollowing);
      } else {
        toast.error("Failed to fetch user profile");
        console.log(data.error)
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("An error occurred while fetching the profile.");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await fetch(`/api/posts?user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        // Ensure the posts include all fields from IPostDocument
        const formattedPosts = data.map((post: IPost) => ({
          ...post,
          _id: new mongoose.Types.ObjectId(String(post._id)), // Convert string ID back to Mongoose ObjectId
          createdAt: new Date(post.createdAt).toISOString(), // Ensure correct Date type
          updatedAt: new Date(post.updatedAt).toISOString(), // Ensure correct Date type
          user: {
            userId: post.user?.userId || "",
            userImage: post.user?.userImage || "",
            firstName: post.user?.firstName || "",
            lastName: post.user?.lastName || "",
          },
          likes: post.likes || [],
          comments: post.comments || [],
        }));

        setPosts(formattedPosts);
      } else {
        toast.error("Failed to fetch user posts");
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    // Immediately update state
    setIsFollowing(true);
    setProfile((prev) => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);

    try {
      const response = await fetch(`/api/followers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId: profile?.userId,
        }),
      });

      if (response.ok) {
        toast.success(`You are now following ${profile?.firstName}`);

        // Re-fetch profile to update followers count
        fetchUserProfile(userId)
      } else {
        toast.error("Failed to follow user");
        setIsFollowing(false); // Revert back to previous state if API call fails
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("An error occurred while following the user.");
      setIsFollowing(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profile) return;

    // Immediately update state
    setIsFollowing(false);
    setProfile((prev) =>
      prev
        ? { ...prev, followersCount: Math.max(prev.followersCount - 1, 0) }
        : null
    );

    try {
      const response = await fetch(`/api/followers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId: profile?.userId,
        }),
      });

      if (response.ok) {
        toast.success(`You unfollowed ${profile?.firstName}`);

        // Re-fetch profile to update followers count
        fetchUserProfile(userId)
      } else {
        toast.error("Failed to unfollow user");
        setIsFollowing(true); // Revert back to previous state if API call fails
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("An error occurred while unfollowing the user.");
      setIsFollowing(true);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-gray-500">Loading...</p>
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-gray-500">User not found</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border shadow-md md:mt-4 flex flex-col mb-0 md:mb-0">
      <div className="p-6 border-b bg-white sticky top-0 sm:top-10 z-10">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={profile.userImage || "/default-avatar.png"} />
            <AvatarFallback>
              {profile.firstName?.charAt(0)}
              {profile.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h1>
            <p className="text-sm text-gray-500">
              {profile.postCount} Posts • {profile.commentCount} Comments
            </p>
            <p className="text-sm text-gray-500">
              {profile.followersCount} Followers • {profile.followingCount} Following
            </p>
          </div>
        </div>

        <div className="mt-4">
          {user?.id !== profile.userId && (
            isFollowing ? (
              <Button variant="secondary" onClick={handleUnfollow}>
                Unfollow
              </Button>
            ) : (
              <Button variant="default" onClick={handleFollow}>
                Follow
              </Button>
            )
          )}
          <h2 className="text-lg font-semibold mt-4">Recent Posts</h2>
        </div>
      </div>

      <div className="mt-6 overflow-y-auto flex-1 scrollbar-hide">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id.toString()} className="mt-3 p-3 border rounded-md">
              <div className="cursor-pointer"
                onClick={() => router.push(`/posts/${post._id}`)}>
                <p>{post.text}</p>
                {post.imageUrl && <SecureImage src={post.imageUrl} alt="Post" className="mt-2 rounded-lg" width={1000} height={1000} />}
                <p className="text-xs text-gray-500 mt-1">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
              {/* PostOptions */}
              <PostOptions post={post} />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No posts yet</p>
        )}
      </div>
    </div>
  );
}