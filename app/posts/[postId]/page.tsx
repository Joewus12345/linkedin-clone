"use server";

import PostOptions from "@/components/PostOptions";
import SecureImage from "@/components/SecureImage";
import TimeAgo from "@/components/Timeago";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  // Protect the route with Clerk authentication
  // auth.protect(); 
  const { postId } = await params;

  const user = await currentUser(); // Get the current user
  await connectDB() // Connect to the database
  const post = await Post.getPostById(postId);

  const isAuthor = user?.id === post.user.userId;

  if (!post) {
    throw new Error("Post not found");
  }

  return (
    <div className="bg-white rounded-lg border sm:m-5 max-w-3xl sm:mx-auto min-h-screen">
      <div className="p-4 flex space-x-2">
        <Link
          className="cursor-pointer"
          href={`/profile/${post.user.userId}`}
        >
          <Avatar>
            <AvatarImage src={post.user.userImage} />
            <AvatarFallback>
              {post.user.firstName?.charAt(0)}
              {post.user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex justify-between flex-1">
          <Link
            className="cursor-pointer"
            href={`/profile/${post.user.userId}`}
          >
            <div className="font-semibold">
              {post.user.firstName} {post.user.lastName}{" "}
              {isAuthor && (
                <Badge className="ml-2" variant="secondary">
                  Author
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">
              @{post.user.firstName}
              {post.user.lastName}-{post.user.userId.toString().slice(-4)}
            </p>

            <p className="text-xs text-gray-400">
              <TimeAgo date={new Date(post.createdAt)} />
            </p>
          </Link>
        </div>
      </div>

      <div>
        <p className="px-4 pb-2 mt-2 whitespace-pre-wrap">{post.text}</p>

        {/* If image uploaded put it here... */}
        {post.imageUrl && (
          <SecureImage
            src={post.imageUrl}
            alt="Post Image"
            width={500}
            height={500}
            className="w-full mx-auto"
          />
        )}
      </div>

      {/* PostOptions */}
      <PostOptions post={post} />
    </div>
  );
}

export default PostPage;
