import connectDB from "@/mongodb/db";
import { IPostBase, Post } from "@/mongodb/models/post";
import { IUserLimited } from "@/mongodb/models/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export interface AddPostRequestBody {
  user: IUserLimited;
  text: string;
  imageUrl?: string | null;
}

export async function POST(request: Request) {
  auth.protect(); // Protect the route with Clerk authentication

  const { user, text, imageUrl }: AddPostRequestBody = await request.json();

  try {
    await connectDB(); // Connect to the database

    const postData: IPostBase = {
      user,
      text,
      ...(imageUrl && { imageUrl }),
    };

    const post = await Post.create(postData);
    return NextResponse.json({ message: "Post created successfully", post });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occured while creating the post ${error}` },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB(); // Connect to the database

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    const filter = userId ? { "user.userId": userId } : {};

    const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: `An error occured while fetching posts ${error}` },
      { status: 500 }
    );
  }
}
