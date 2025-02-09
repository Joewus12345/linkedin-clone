import connectDB from "@/mongodb/db";
import { User } from "@/mongodb/models/user";
import { Followers } from "@/mongodb/models/followers";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  auth.protect();
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("current_user_id");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Current user ID is required" },
        { status: 400 }
      );
    }

    // Fetch following users
    const following = await Followers.find({
      "follower.userId": currentUserId,
    }).select("following");

    const followingIds = following.map((f) => f.following.userId.toString());

    // Fetch all users and their post & comment count
    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "userId",
          foreignField: "user.userId",
          as: "userPosts",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "userId",
          foreignField: "user.userId",
          as: "userComments",
        },
      },
      {
        $project: {
          _id: "$userId",
          userImage: 1,
          firstName: 1,
          lastName: 1,
          postCount: { $size: "$userPosts" }, // Count user's posts
          commentCount: { $size: "$userComments" }, // Count user's comments
          isFollowing: { $in: ["$userId", followingIds] },
        },
      },
    ]);

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while fetching users: ${error}` },
      { status: 500 }
    );
  }
}
