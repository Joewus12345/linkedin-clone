import { IPostDocument } from "@/mongodb/models/post"
import Post from "./Post"

function PostFeed({ posts }: { posts: IPostDocument[] }) {
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
