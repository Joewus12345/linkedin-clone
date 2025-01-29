import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { Followers } from "@/mongodb/models/followers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

    // Fetch the list of users the current user is following
    const following = await Followers.find({
      "follower.userId": currentUserId,
    }).select("following");

    const followingIds = following.map((f) => f.following.userId.toString());

    // Fetch all users and calculate their post/comment counts
    const users = await Post.aggregate([
      {
        $group: {
          _id: "$user.userId", // Group by userId
          postCount: { $sum: 1 }, // Count posts
          commentCount: { $sum: { $size: "$comments" } }, // Count comments
          userImage: { $first: "$user.userImage" }, // Get user image
          firstName: { $first: "$user.firstName" }, // Get first name
          lastName: { $first: "$user.lastName" }, // Get last name
        },
      },
    ]);

    // Add `isFollowing` to each user based on the following list
    const enrichedUsers = users.map((user) => ({
      ...user,
      isFollowing: followingIds.includes(user._id.toString()),
    }));

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while fetching users: ${error}` },
      { status: 500 }
    );
  }
}
