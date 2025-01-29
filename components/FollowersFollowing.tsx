"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Follower, Following } from "@/types/user";

function FollowersFollowing() {
  const { user } = useUser();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchFollowers(user.id);
      fetchFollowing(user.id);
    }
  }, [user]);

  const fetchFollowers = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/followers?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setFollowers(data);
      } else {
        toast.error("Failed to fetch followers");
        console.error(data.error);
      }
    } catch (error) {
      toast.error("An error occurred while fetching followers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/following?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setFollowing(data);
      } else {
        toast.error("Failed to fetch following");
        console.error(data.error);
      }
    } catch (error) {
      toast.error("An error occurred while fetching following");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (followingUserId: string) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/followers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerUserId: user?.id,
          followingUserId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Unfollowed successfully");
        fetchFollowing(user.id);
      } else {
        toast.error("Failed to unfollow user");
        console.error(data.error);
      }
    } catch (error) {
      toast.error("An error occurred while unfollowing user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-white mr-6 rounded-lg border py-4 w-full md:w-auto mb-2">
      <h3 className="text-lg font-semibold text-center">Followers & Following</h3>

      <div className="mt-4">
        <h4 className="font-medium text-gray-700 text-center">Followers</h4>
        {followers.length > 0 ? (
          followers.map((follower: Follower) => (
            <div key={follower.follower} className="flex items-center space-x-4 py-2">
              <Avatar>
                <AvatarImage src={follower.followerImage || "/default-avatar.png"} />
                <AvatarFallback>
                  {follower.followerFirstName?.charAt(0)}
                  {follower.followerLastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p>{`${follower.followerFirstName} ${follower.followerLastName}`}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">No followers yet</p>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-medium text-gray-700 text-center">Following</h4>
        {following.length > 0 ? (
          following.map((followed: Following) => (
            <div key={followed.following} className="flex flex-wrap items-center space-x-4 py-2 justify-center">
              <Avatar>
                <AvatarImage src={followed.followingImage || "/default-avatar.png"} />
                <AvatarFallback>
                  {followed.followingFirstName?.charAt(0)}
                  {followed.followingLastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p>{`${followed.followingFirstName} ${followed.followingLastName}`}</p>
              <Button
                variant="outline"
                onClick={() => handleUnfollow(followed.following)}
                disabled={isLoading}
              >
                Unfollow
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">Not following anyone</p>
        )}
      </div>
    </div>
  );
}

export default FollowersFollowing;