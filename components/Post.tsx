"use client"

import { IPostDocument } from "@/mongodb/models/post"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import ReactTimeago from "react-timeago"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"
import deletePostAction from "@/actions/deletePostAction"
import Image from "next/image"
import PostOptions from "./PostOptions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser()

  const isAuthor = user?.id === post.user.userId
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 flex space-x-2">
        <div
          className=" cursor-pointer"
          onClick={() => router.push(`/profile/${post.user.userId}`)}
        >
          <Avatar>
            <AvatarImage src={post.user.userImage} />
            <AvatarFallback>
              {post.user.firstName?.charAt(0)}
              {post.user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-between flex-1">
          <div
            className=" cursor-pointer"
            onClick={() => router.push(`/profile/${post.user.userId}`)}
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
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>

          {isAuthor && (
            <Button variant="outline"
              onClick={() => {
                const promise = deletePostAction(post._id.toString())

                // Toast notification based on the promise above
                toast.promise(promise, {
                  loading: "Deleting post...",
                  success: "Post deleted",
                  error: "Failed to delete post",
                })
              }}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div
        className=" cursor-pointer"
        onClick={() => router.push(`/posts/${post._id}`)}
      >
        <p className="px-4 pb-2 mt-2 whitespace-pre-wrap">{post.text}</p>

        {/* If image uploaded put it here... */}
        {post.imageUrl && (
          <Image
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
  )
}

export default Post
