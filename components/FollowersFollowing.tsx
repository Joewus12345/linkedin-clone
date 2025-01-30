"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Follower, Following } from "@/types/user";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

function FollowersFollowing() {
  const { user } = useUser();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
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
        setFollowers(data.followers);
        setFollowing(data.following);
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
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
      <h3 className="text-lg font-semibold text-center">
        Followers & Following
      </h3>

      <p className="text-sm text-gray-500 text-center">
        {followersCount} Followers • {followingCount} Following
      </p>

      <Accordion type="single" collapsible className="w-full p-2">
        <AccordionItem value="followers">
          <AccordionTrigger className="font-medium text-gray-700 text-center">
            Followers
          </AccordionTrigger>
          <AccordionContent>
            {followers.length > 0 ? (
              followers.map((follower: Follower) => (
                <div
                  key={follower.follower}
                  className="flex items-center space-x-2 p-2 border m-2 rounded-lg"
                >
                  <Avatar>
                    <AvatarImage
                      src={follower.followerImage || "/default-avatar.png"}
                    />
                    <AvatarFallback>
                      {follower.followerFirstName?.charAt(0)}
                      {follower.followerLastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <a href={`/profile/${follower.follower}`} className="hover:underline hover:text-blue-800">
                    {`${follower.followerFirstName} ${follower.followerLastName}`}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No followers yet
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="following">
          <AccordionTrigger className="font-medium text-gray-700 text-center">
            Following
          </AccordionTrigger>
          <AccordionContent>
            {following.length > 0 ? (
              following.map((followed: Following) => (
                <div
                  key={followed.following}
                  className="flex flex-wrap items-center space-x-2 p-2 border m-2 rounded-lg space-y-2"
                >
                  <Avatar>
                    <AvatarImage
                      src={followed.followingImage || "/default-avatar.png"}
                    />
                    <AvatarFallback>
                      {followed.followingFirstName?.charAt(0)}
                      {followed.followingLastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <a href={`/profile/${followed.following}`} className="hover:underline hover:text-blue-800">{`${followed.followingFirstName} ${followed.followingLastName}`}</a>
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
              <p className="text-sm text-gray-500 text-center">
                Not following anyone
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default FollowersFollowing;