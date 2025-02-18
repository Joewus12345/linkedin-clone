"use client"

import { IPostDocument } from "@/mongodb/models/post"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import ReactTimeago from "react-timeago"
import { Badge } from "./ui/badge"

function CommentFeed({ post }: { post: IPostDocument }) {
  const { user } = useUser()

  const isAuthor = user?.id === post.user.userId

  return (
    <div className="space-y-2 mt-3 mb-2">
      {post.comments?.map((comment) => {
        if (!comment?.user) return null

        return (
          <div key={comment._id.toString()} className="flex space-x-1 m-2">
            <Avatar>
              <AvatarImage src={comment.user?.userImage || ""} />
              <AvatarFallback>
                {comment.user?.firstName?.charAt(0)}
                {comment.user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div
              className="bg-gray-100 px-4 py-2 rounded-md w-full md:w-auto sm:min-w-[300px] flex-1"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">
                    {comment.user?.firstName} {comment.user?.lastName}{" "}
                    <Badge
                      variant="outline"
                      className="w-auto h-auto"
                    >
                      {isAuthor && "Author"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    @{comment.user?.firstName}
                    {comment.user?.lastName}-{comment.user?.userId?.toString().slice(-4)}
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  <ReactTimeago date={new Date(comment.createdAt)} />
                </p>
              </div>

              <p className="mt-3 text-sm">{comment.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CommentFeed
