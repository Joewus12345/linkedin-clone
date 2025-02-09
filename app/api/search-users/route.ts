import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { User } from "@/mongodb/models/user";
import { NextResponse } from "next/server";
import NodeCache from "node-cache";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

interface UserResult {
  userId: string;
  firstName: string;
  lastName?: string;
  userImage: string;
}

interface PostResult {
  _id: string;
  text: string;
  user: {
    userId: string;
    firstName: string;
    lastName?: string;
    userImage: string;
  };
}

const cache = new NodeCache({ stdTTL: 60 * 5 }); // Cache results for 5 minutes

export async function GET(request: Request) {
  auth.protect();
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResults = cache.get(query);
    if (cachedResults) {
      return NextResponse.json(cachedResults);
    }

    // Search Users in `User` model
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    })
      .select("userId firstName lastName userImage")
      .lean();

    // Ensure the data matches the UserResult type
    const formattedUsers: UserResult[] = users.map((user) => ({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName || "",
      userImage: user.userImage || "",
    }));

    // Search Posts in `Post` model
    const posts = await Post.find({
      text: { $regex: query, $options: "i" },
    })
      .select("_id text user")
      .populate("user", "userId firstName lastName userImage")
      .lean();

    // Ensure `_id` is converted to a string & matches PostResult type
    const formattedPosts: PostResult[] = posts.map((post) => ({
      _id: (post._id as mongoose.Types.ObjectId).toString(), // Convert ObjectId to string
      text: post.text,
      user: {
        userId: post.user.userId,
        firstName: post.user.firstName,
        lastName: post.user.lastName || "",
        userImage: post.user.userImage || "",
      },
    }));

    const searchResults = { users: formattedUsers, posts: formattedPosts };

    // Cache results
    cache.set(query, searchResults);

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
