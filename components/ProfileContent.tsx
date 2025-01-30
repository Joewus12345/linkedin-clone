'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { IUser } from "@/types/user";

interface IProfile {
  userId: IUser["userId"];
  userImage: string;
  firstName: string;
  lastName: string;
  postCount: number;
  commentCount: number;
  followersCount: number;
  followingCount: number;
}

interface IPost {
  _id: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export default function ProfilePage({ userId }: { userId: IUser["userId"] }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>();
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
        toast.error(data.error || "Failed to fetch user profile");
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
        setPosts(data);
      } else {
        toast.error("Failed to fetch user posts");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    // Immediately update state
    setIsFollowing(true);
    setProfile((prevProfile) => prevProfile ? { ...prevProfile, followersCount: prevProfile.followersCount + 1 } : null);

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
    setProfile((prevProfile) =>
      prevProfile
        ? { ...prevProfile, followersCount: Math.max(prevProfile.followersCount - 1, 0) }
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

  if (isLoading) return <p className="flex items-center justify-center min-h-screen text-center">Loading...</p>;

  if (!profile) return <p className="flex items-center justify-center min-h-screen text-center">User not found</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border shadow-md mt-4 flex flex-col max-h-[80vh] sm:mb-20 md:mb-0">
      <div className="p-6 border-b bg-white sticky top-0 z-10">
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
            <div key={post._id} className="mt-3 p-3 border rounded-md">
              <p>{post.text}</p>
              {post.imageUrl && <Image src={post.imageUrl} alt="Post" className="mt-2 rounded-lg" width={500} height={500} />}
              <p className="text-xs text-gray-500 mt-1">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No posts yet</p>
        )}
      </div>
    </div>
  );
}