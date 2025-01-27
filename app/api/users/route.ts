import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

// GET all users with their post and comment counts
export async function GET() {
  try {
    await connectDB();

    // Fetch all users and calculate post/comment counts
    const users = await Post.aggregate([
      {
        $group: {
          _id: "$user.userId", // Group by userId
          postCount: { $sum: 1 }, //Count posts
          commentCount: { $sum: { $size: "$comments" } }, // Count comments
          userImage: { $first: "$user.userImage" }, // Get user image
          firstName: { $first: "$user.firstName" }, // Get first name
          lastName: { $first: "$user.lastName" }, // Get last name
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
