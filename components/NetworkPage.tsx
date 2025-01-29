"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

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
        toast.error(data.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An error occurred while fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (followingUserId: string) => {
    try {
      const response = await fetch("/api/followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId,
        }),
      });

      if (response.ok) {
        // Optimistically update state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === followingUserId ? { ...u, isFollowing: true } : u
          )
        );
        toast.success("Followed successfully");
      } else {
        const errorData = await response.json();
        console.error("Follow error:", errorData.error);
        toast.error(errorData.error || "Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("An error occurred while following user");
    }
  };

  const handleUnfollow = async (followingUserId: string) => {
    try {
      const response = await fetch("/api/followers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId,
        }),
      });

      if (response.ok) {
        // Optimistically update state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === followingUserId ? { ...u, isFollowing: false } : u
          )
        );
        toast.success("Unfollowed successfully");
      } else {
        const errorData = await response.json();
        console.error("Unfollow error:", errorData.error);
        toast.error(errorData.error || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("An error occurred while unfollowing user");
    }
  };

  if (isLoading && users.length === 0) {
    return <p className="flex items-center justify-center min-h-screen">Loading...</p>;
  }

  return (
    <div className="bg-white p-4 rounded-lg border m-5">
      <h3 className="text-lg font-semibold text-center items-center">Network</h3>
      <div className="mt-4 space-y-4">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={u.userImage || "/default-avatar.png"} />
                <AvatarFallback>
                  {u.firstName.charAt(0)} {u.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Posts: {u.postCount} | Comments: {u.commentCount}
                </p>
              </div>
            </div>
            <div>
              {u._id === user?.id ? (
                <Button variant="outline" disabled>
                  Yourself
                </Button>
              ) : u.isFollowing ? (
                <Button
                  variant="secondary"
                  onClick={() => handleUnfollow(u._id)}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => handleFollow(u._id)}
                >
                  Follow
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NetworkPage;
