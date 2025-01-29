import connectDB from "@/mongodb/db";
import { Comment } from "@/mongodb/models/comment";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

// GET user profile details
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

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

    return NextResponse.json({ userId, postCount, commentCount });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching user data ${error}` },
      { status: 500 }
    );
  }
}
