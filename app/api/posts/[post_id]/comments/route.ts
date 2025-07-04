import connectDB from "@/mongodb/db";
import { ICommentBase } from "@/mongodb/models/comment";
import { Post } from "@/mongodb/models/post";
import { IUserLimited } from "@/mongodb/models/user";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    await connectDB();
    const { post_id } = await params;

    const post = await Post.findById(post_id).populate({
      path: "comments",
      populate: {
        path: "user",
        select: "userId userImage firstName lastName",
      },
      options: { sort: { createdAt: -1 } }, // Sort newest first
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await post.getAllComments();
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while fetching comments ${error}` },
      { status: 500 }
    );
  }
}

export interface AddCommentRequestBody {
  user: IUserLimited;
  text: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  await connectDB();
  const { post_id } = await params;

  const { user, text }: AddCommentRequestBody = await request.json();
  try {
    const post = await Post.findById(post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment: ICommentBase = {
      user,
      text,
    };

    await post.commentOnPost(comment);
    return NextResponse.json({ message: "Comment added successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while adding comment ${error}` },
      { status: 500 }
    );
  }
}
