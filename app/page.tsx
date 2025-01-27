import FollowersFollowing from "@/components/FollowersFollowing";
import PostFeed from "@/components/PostFeed";
import PostForm from "@/components/PostForm";
import UserInformation from "@/components/UserInformation";
import Widget from "@/components/Widget";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { SignedIn } from "@clerk/nextjs";

export const revalidate = 0;

export default async function Home() {
  await connectDB();
  const posts = await Post.getAllPosts();


  return (
    <div className="grid grid-cols-1 md:grid-cols-8 mt-5 sm:px-5">
      <section className="md:inline md:col-span-2 md:order-1">
        {/* UserInformation */}
        <UserInformation posts={posts} />

        <hr className="mb-2 border-gray-300 md:mr-6" />

        {/* Followers and Following */}
        <SignedIn>
          <FollowersFollowing />
        </SignedIn>
      </section>

      <hr className="mb-2 border-gray-300 md:hidden" />

      <section className="col-span-full md:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto w-full md:order-2">
        {/* PostForm */}
        <SignedIn>
          <PostForm />
        </SignedIn>

        {/* PostFeed */}
        <PostFeed posts={posts} />
      </section>

      <section className="xl:inline w-full md:col-start-3 md:col-span-6 order-3 mx-auto xl:col-span-2">
        {/* Widget */}
        <Widget />
      </section>
    </div>
  );
}
