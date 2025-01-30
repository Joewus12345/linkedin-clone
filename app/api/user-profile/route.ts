import connectDB from "@/mongodb/db";
import { Comment } from "@/mongodb/models/comment";
import { Followers } from "@/mongodb/models/followers";
import { Post } from "@/mongodb/models/post";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET user profile details
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

    // Count posts and comments
    const postCount = await Post.countDocuments({ "user.userId": userId });
    const commentCount = await Comment.countDocuments({
      "user.userId": userId,
    });

    // Fetch followers and following count
    const followersCount = await Followers.countDocuments({
      "following.userId": userId,
    });
    const followingCount = await Followers.countDocuments({
      "follower.userId": userId,
    });

    // Fetch the first available post to get user details
    const userPost = await Post.findOne({ "user.userId": userId })
      .select("user")
      .lean();

    if (!userPost) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = await Followers.exists({
      "follower.userId": currentUserId,
      "following.userId": userId,
    });

    const { userImage, firstName, lastName } = userPost.user;

    return NextResponse.json({
      userId,
      userImage,
      firstName,
      lastName,
      postCount,
      commentCount,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching user data ${error}` },
      { status: 500 }
    );
  }
}
