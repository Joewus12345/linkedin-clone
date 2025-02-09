import { IPostDocument } from "@/mongodb/models/post"
import Post from "./Post"

function PostFeed({ posts }: { posts: IPostDocument[] }) {
  if (!posts || posts.length === 0) {
    return <p className="flex justify-center items-center text-gray-500 text-center min-h-screen">No posts to show</p>
  }
  return (
    <div className="space-y-2 xl:pb-20">
      {posts.map((post) => (
        <Post key={post._id.toString()} post={post} />
      ))}

      <hr className="border-gray-300 xl:hidden" />
    </div>
  )
}

export default PostFeed
