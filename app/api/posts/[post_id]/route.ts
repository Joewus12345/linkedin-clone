import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  await connectDB(); // Connect to the database
  const { post_id } = await params;

  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: `An error occured while fetching the post ${error}` },
      { status: 500 }
    );
  }
}

export async function GETBYID(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  try {
    await connectDB(); // Ensure the database is connected
    const { post_id } = params;

    if (!post_id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const post = await Post.getPostById(post_id);

    return NextResponse.json(post); // Return the post data
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: `Failed to fetch the post: ${error}` },
      { status: 500 }
    );
  }
}

export interface DeletePostRequestBody {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  auth.protect(); // Protect the route with Clerk authentication
  const { post_id } = await params;

  // const user = await currentUser(); when using this line, you have to use the commented if statement below and comment out the one({userId}) below it

  await connectDB(); // Connect to the database

  const { userId }: DeletePostRequestBody = await request.json();

  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // if (post.user.userId !== user?.id) {
    //   throw new Error("The post does not belong to the user");
    // }

    if (post.user.userId !== userId) {
      throw new Error("The post does not belong to the user");
    }

    await post.removePost();
  } catch (error) {
    return NextResponse.json(
      { error: `An error occured while deleting the post ${error}` },
      { status: 500 }
    );
  }
}
