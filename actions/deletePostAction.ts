"use server";

import { Post } from "@/mongodb/models/post";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";

export default async function deletePostAction(postId: string) {
  const user = await currentUser();

  if (!user?.id) {
    toast.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  const post = await Post.findById(postId);

  if (!post) {
    toast.error("Post not found");
    throw new Error("Post not found");
  }

  if (post.user.userId !== user.id) {
    toast.error("Post does not belong to user");
    throw new Error("Post does not belong to user");
  }

  try {
    await post.removePost();
    revalidatePath("/");
  } catch (error) {
    console.log("An error occurred while deleting the post", error);
  }
}
