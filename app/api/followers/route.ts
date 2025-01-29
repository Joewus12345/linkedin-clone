import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import { Post } from "@/mongodb/models/post";
import { IUser } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET function is used to get all followers of a user
export async function GET(request: Request) {
  auth.protect();

  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  try {
    await connectDB();

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 400 }
      );
    }

    const followers = await Followers.getAllFollowers(user_id);

    if (!followers) {
      return NextResponse.json(
        { error: "No followers found" },
        { status: 200 }
      );
    }

    return NextResponse.json(followers);
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while fetching followers ${error}` },
      { status: 500 }
    );
  }
}

export interface FollowerRequestBody {
  followerUserId: string;
  followingUserId: string;
}

// POST function is used to add a follower to a user
export async function POST(request: Request) {
  try {
    await connectDB();
    const { followerUserId, followingUserId }: FollowerRequestBody =
      await request.json();

    // Validate input
    if (!followerUserId || !followingUserId) {
      return NextResponse.json(
        { error: "Follower ID or Following ID not provided" },
        { status: 400 }
      );
    }

    // Fetch user details from Post collection
    const followerData = await Post.findOne(
      { "user.userId": followerUserId },
      "user"
    ).lean();
    const followingData = await Post.findOne(
      { "user.userId": followingUserId },
      "user"
    ).lean();

    if (!followerData || !followingData) {
      return NextResponse.json(
        { error: "User data not found for follower or following" },
        { status: 404 }
      );
    }

    const follower: IUser = followerData.user;
    const following: IUser = followingData.user;

    // Add follower relationship
    const follow = await Followers.follow(follower, following);

    if (!follow) {
      return NextResponse.json(
        { error: "Follow action failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while following ${error}` },
      { status: 500 }
    );
  }
}

// DELETE function is used to remove a follower from a user
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { followerUserId, followingUserId }: FollowerRequestBody =
      await request.json();

    if (!followerUserId || !followingUserId) {
      return NextResponse.json(
        { error: "Follower ID or Following ID not provided" },
        { status: 400 }
      );
    }

    const follow = await Followers.findOne({
      "follower.userId": followerUserId,
      "following.userId": followingUserId,
    });

    if (!follow) {
      return NextResponse.json(
        { error: "Follow relationship not found" },
        { status: 404 }
      );
    }

    await follow.unfollow();
    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while unfollowing ${error}` },
      { status: 500 }
    );
  }
}
