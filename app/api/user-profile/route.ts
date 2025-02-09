import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import { Post } from "@/mongodb/models/post";
import { User } from "@/mongodb/models/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the IUser interface
interface IUser {
  userId: string;
  firstName: string;
  lastName?: string;
  userImage?: string;
}

export async function GET(request: Request) {
  auth.protect();
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    const { userId: currentUserId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user details safely
    const user = (await User.findOne({ userId })
      .select("userId firstName lastName userImage")
      .lean()
      .exec()) as IUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch post count efficiently
    const postCount = await Post.countDocuments({ "user.userId": userId });

    // Fetch comment count using aggregation
    const commentCountResult = await Post.aggregate([
      { $match: { comments: { $ne: [] } } }, // Ensure there are comments
      { $unwind: "$comments" }, // Flatten the comments array
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "populatedComments",
        },
      },
      { $unwind: "$populatedComments" }, // Flatten populated comments array
      { $match: { "populatedComments.user.userId": userId } }, // Filter user comments
      { $count: "commentCount" }, // Count results
    ]);

    const commentCount =
      commentCountResult.length > 0 ? commentCountResult[0].commentCount : 0;

    // Fetch followers & following count
    const followersCount = await Followers.countDocuments({
      "following.userId": userId,
    });

    const followingCount = await Followers.countDocuments({
      "follower.userId": userId,
    });

    // Check if current user is following this profile
    const isFollowing = currentUserId
      ? !!(await Followers.exists({
          "follower.userId": currentUserId,
          "following.userId": userId,
        }))
      : false;

    return NextResponse.json({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      userImage: user.userImage || "",
      postCount,
      commentCount,
      followersCount,
      followingCount,
      isFollowing,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `Error fetching user data: ${error}` },
      { status: 500 }
    );
  }
}
