"use client"

import { IPostDocument } from "@/mongodb/models/post"
import { SignedIn, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { LikePostRequestBody } from "@/app/api/posts/[post_id]/like/route"
import { UnlikePostRequestBody } from "@/app/api/posts/[post_id]/unlike/route"
import CommentFeed from "./CommentFeed"
import CommentForm from "./CommentForm"
import { toast } from "sonner"
import ShareButton from "./ShareButton"
import createPostAction from "@/actions/createPostAction"
import { BASE_URL } from "@/types/user"

function PostOptions({ post }: { post: IPostDocument }) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const { user } = useUser()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const post_id = post._id.toString()

  const handleSendClick = () => {
    setIsShareOpen(!isShareOpen)
  }

  const handleRepost = async () => {
    if (!user?.id) {
      toast.error("User not authenticated")
      throw new Error("User not authenticated")
    }

    if (!post_id) {
      console.error("Invalid post ID")
    }

    try {
      const formData = new FormData()
      formData.append("repostId", post_id)

      const promise = createPostAction(formData)
      toast.promise(promise, {
        loading: "Reposting...",
        success: "Post reposted",
        error: "Failed to repost",
      })
    } catch (error) {
      console.error("Failed to repost", error)
    }
  }

  useEffect(() => {
    if (user?.id && post.likes?.includes(user.id)) {
      setLiked(true)
    }
  }, [post, user])

  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      toast.error("User not authenticated")
      throw new Error("User not authenticated")
    }

    const originalLiked = liked
    const originalLikes = likes

    const newLikes = liked ? likes?.filter((like) => like !== user.id) : [...(likes ?? []), user.id]

    const body: LikePostRequestBody | UnlikePostRequestBody = {
      userId: user.id,
    }

    setLiked(!liked)
    setLikes(newLikes)

    const response = await fetch(`/api/posts/${post._id}/${liked ? "unlike" : "like"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      setLiked(originalLiked)
      setLikes(originalLikes)
      toast.error(`Failed to ${liked ? "Unlike post" : "Like post"}`)
      throw new Error(`Failed to ${liked ? "Unlike post" : "Like post"}`)
    }

    const fetchLikesResponse = await fetch(`/api/posts/${post._id}/like`)

    if (!fetchLikesResponse.ok) {
      setLiked(originalLiked)
      setLikes(originalLikes)

      throw new Error("Failed to fetch likes")
    }

    const newLikedData = await fetchLikesResponse.json()

    setLikes(newLikedData)
  }

  return (
    <div>
      <div className="flex justify-between p-4">
        <div>
          {likes && likes.length > 0 && (
            <p className="text-xs text-gray-500 cursor-pointer">
              {likes.length} {likes.length === 1 ? "like" : "likes"}
            </p>
          )}
        </div>

        <div>
          {post?.comments && post.comments.length > 0 && (
            <p
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="text-xs text-gray-500 cursor-pointer hover:underline"
            >
              {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
            </p>
          )}
        </div>
      </div>

      <div className="flex p-2 justify-between px-2 border-t">
        <Button
          variant="ghost"
          className="postButton"
          onClick={() => {
            const promise = likeOrUnlikePost()
            toast.promise(promise, {
              loading: liked ? "Unliking Post" : "Liking post...",
              success: liked ? "Post unliked" : "Post liked",
              error: `Failed to ${liked ? "Unlike post" : "Like post"}`,
            })
          }}
        >
          {/* If user has liked the post, show filled thumbs up icon */}
          <ThumbsUpIcon
            className={cn("mr-1", liked && "text-[#4881c2] fill-[#4881c2]")}
          />
          {liked ? "Unlike" : "Like"}
        </Button>

        <Button
          variant="ghost"
          className="postButton"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
        >
          <MessageCircle
            className={cn("mr-1", isCommentsOpen && "text-gray-600 fill-gray-600")}
          />
          Comment
        </Button>

        <Button variant="ghost" className="postButton" onClick={handleRepost}>
          <Repeat2 className="mr-1" />
          Repost
        </Button>

        <Button variant="ghost" className="postButton" onClick={handleSendClick}>
          <Send className="mr-1" />
          Send
        </Button>
      </div>

      {isCommentsOpen && (
        <div>
          <SignedIn>
            {user?.id && <CommentForm postId={post._id.toString()} />}
          </SignedIn>

          <CommentFeed post={post} />
        </div>
      )}

      {isShareOpen && post_id && (
        <ShareButton url={`${BASE_URL}/posts/${post_id}`} />
      )}
    </div>
  )
}

export default PostOptions
