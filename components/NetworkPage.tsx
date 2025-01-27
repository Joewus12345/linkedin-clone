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
  const { user } = useUser();
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        toast.error(data.error || "Failed to fetch users");
      }
    } catch (error) {
      toast.error("An error occurred while fetching users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (followingUserId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/followers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Followed successfully");

        // Update the `users` state directly
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === followingUserId ? { ...u, isFollowing: true } : u
          )
        );
      } else {
        toast.error(data.error || "Failed to follow user");
      }
    } catch (error) {
      toast.error("An error occurred while following user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (followingUserId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/followers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Unfollowed successfully");

        // Update the `users` state directly
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === followingUserId ? { ...u, isFollowing: false } : u
          )
        );
      } else {
        toast.error(data.error || "Failed to unfollow user");
      }
    } catch (error) {
      toast.error("An error occurred while unfollowing user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border m-5">
      <h3 className="text-lg font-semibold">Network</h3>
      <div className="mt-4 space-y-4">
        {users.map((u: IUser) => (
          <div key={u._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={u.userImage || user?.imageUrl} />
                <AvatarFallback>
                  {u.firstName?.charAt(0) || user?.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {u.firstName || user?.firstName} {u.lastName || user?.lastName}
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
                  disabled={isLoading}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => handleFollow(u._id)}
                  disabled={isLoading}
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
