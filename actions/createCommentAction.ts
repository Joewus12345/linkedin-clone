"use server";

import { AddCommentRequestBody } from "@/app/api/posts/[post_id]/comments/route";
import { ICommentBase } from "@/mongodb/models/comment";
import { Post } from "@/mongodb/models/post";
import { IUserDocument, User } from "@/mongodb/models/user";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";

export async function createCommentAction(postId: string, formData: FormData) {
  const user = await currentUser();
  const commentInput = formData.get("commentInput") as string;

  if (!postId) {
    toast.error("Post ID is required");
    throw new Error("Post ID is required");
  }
  if (!commentInput) {
    toast.error("Comment input is required");
    throw new Error("Comment input is required");
  }
  if (!user?.id) {
    toast.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  const userDB: IUserDocument | null = await User.findOne({ userId: user.id });

  if (!userDB) {
    toast.error("User not found in database");
    throw new Error("User not found in database");
  }

  const body: AddCommentRequestBody = {
    user: userDB,
    text: commentInput,
  };

  if (!body.text || !body.user) {
    toast.error("Comment input or user is required");
    throw new Error("Comment input or user is required");
  }
  const post = await Post.findById(postId);

  if (!post) {
    toast.error("Post not found");
    throw new Error("Post not found");
  }

  const comment: ICommentBase = {
    user: userDB,
    text: commentInput,
  };

  try {
    await post.commentOnPost(comment);
    revalidatePath("/");
  } catch (error) {
    toast.error("An error occurred while adding comment");
    throw new Error(`An error occurred while adding comment ${error}`);
  }
}
