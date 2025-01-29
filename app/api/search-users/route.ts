import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { Followers } from "@/mongodb/models/followers";
import { NextResponse } from "next/server";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 5 }); // Cache results for 5 minutes

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResults = cache.get(query);
    if (cachedResults) {
      return NextResponse.json(cachedResults);
    }

    // Fetch unique users from posts collection
    const postUsers = await Post.aggregate([
      {
        $match: {
          $or: [
            { "user.firstName": { $regex: query, $options: "i" } },
            { "user.lastName": { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: "$user.userId",
          userId: { $first: "$user.userId" },
          firstName: { $first: "$user.firstName" },
          lastName: { $first: "$user.lastName" },
          userImage: { $first: "$user.userImage" },
        },
      },
      { $limit: 5 },
    ]);

    // Fetch unique users from followers collection
    const followerUsers = await Followers.aggregate([
      {
        $lookup: {
          from: "followers",
          localField: "follower",
          foreignField: "userId",
          as: "followerData",
        },
      },
      {
        $lookup: {
          from: "followers",
          localField: "following",
          foreignField: "userId",
          as: "followingData",
        },
      },
      {
        $project: {
          userId: "$follower",
          firstName: "$followerData.firstName",
          lastName: "$followerData.lastName",
          userImage: "$followerData.userImage",
        },
      },
      {
        $match: {
          $or: [
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
          ],
        },
      },
      { $limit: 5 },
    ]);

    // Merge results and remove duplicates
    const mergedResults = [...postUsers, ...followerUsers].reduce(
      (acc, user) => {
        if (!acc.some((u) => u.userId === user.userId)) {
          acc.push(user);
        }
        return acc;
      },
      []
    );

    // Store results in cache
    cache.set(query, mergedResults);

    return NextResponse.json(mergedResults);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "An error occurred while searching users" },
      { status: 500 }
    );
  }
}
