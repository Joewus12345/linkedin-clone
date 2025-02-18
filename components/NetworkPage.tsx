"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface IUser {
  _id: string;
  userImage: string;
  firstName: string;
  lastName: string;
  postCount: number;
  commentCount: number;
  isFollowing: boolean;
}

function NetworkPage() {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  const fetchUsers = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?current_user_id=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        console.error("Error fetching users:", data.error);
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An error occurred while fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserFollowState = (userId: string, isFollowing: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === userId ? { ...u, isFollowing } : u
      )
    );
  };

  const handleFollow = async (followingUserId: string) => {
    if (!user?.id) return;
    updateUserFollowState(followingUserId, true);

    try {
      const response = await fetch("/api/followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUserId: user?.id, followingUserId }),
      });

      if (!response.ok) throw new Error("Failed to follow user");
      toast.success("Followed successfully");
    } catch (error) {
      updateUserFollowState(followingUserId, false);
      toast.error("An error occurred while following user");
      console.log(error)
    }
  };

  const handleUnfollow = async (followingUserId: string) => {
    if (!user?.id) return;
    updateUserFollowState(followingUserId, false);

    try {
      const response = await fetch("/api/followers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUserId: user?.id, followingUserId }),
      });

      if (!response.ok) throw new Error("Failed to unfollow user");
      toast.success("Unfollowed successfully");
    } catch (error) {
      updateUserFollowState(followingUserId, true);
      toast.error("An error occurred while unfollowing user");
      console.log(error)
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-2 px-4 md:pt-2 md:p-5 pb-2">
      <h3 className="text-2xl font-bold border-b py-2 text-center bg-white">
        Network
      </h3>

      <div className="mt-2 md:mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="bg-white shadow-md border rounded-lg overflow-hidden transition-transform transform sm:hover:scale-105 h-80 cursor-pointer"
          >
            {/* Upper Half: Image */}
            <div
              className="w-full h-[50%] relative"
              onClick={() => router.push(`/profile/${u._id}`)}
            >
              <Avatar
                className="flex justify-center items-center h-auto w-auto rounded-none absolute inset-0 object-cover"
              >
                <AvatarImage src={u.userImage || ""} />
                <AvatarFallback>
                  {u.firstName.charAt(0)}
                  {u.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Lower Half: User Info */}
            <div className="mt-2 text-center relative bg-white">
              <div
                onClick={() => router.push(`/profile/${u._id}`)}
                className="font-semibold text-lg"
              >
                {u.firstName} {u.lastName}
              </div>

              {/* Follow/Unfollow Button */}
              <div className="mt-2">
                {u._id === user?.id ? (
                  <Button variant="outline" disabled>
                    Yourself
                  </Button>
                ) : u.isFollowing ? (
                  <Button variant="secondary"
                    onClick={() => handleUnfollow(u._id)}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button variant="default"
                    onClick={() => handleFollow(u._id)}
                  >
                    Follow
                  </Button>
                )}
              </div>

              {/* Post & Comment Count */}
              <div
                className="mt-2 text-sm text-gray-600 flex justify-around px-4"
                onClick={() => router.push(`/profile/${u._id}`)}
              >
                <span>Posts: <strong>{u.postCount}</strong></span>
                <span>Comments: <strong>{u.commentCount}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NetworkPage;
