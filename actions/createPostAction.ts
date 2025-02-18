"use server";

import { AddPostRequestBody } from "@/app/api/posts/route";
import generateSASTokenForBlob, { containerName } from "@/lib/generateSASToken";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { IUserDocument, User } from "@/mongodb/models/user";
import { BlockBlobClient } from "@azure/storage-blob";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export default async function createPostAction(formData: FormData) {
  const user = await currentUser();
  const postInput = formData.get("postInput") as string;
  const repostId = formData.get("repostId") as string | null;
  const image = formData.get("image") as File;
  let image_url: string | undefined = undefined;

  if (!user?.id) {
    console.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  // ....com/api/posts

  try {
    await connectDB();

    const userDB: IUserDocument | null = await User.findOne({
      userId: user.id,
    });

    if (!userDB) {
      console.error("User not found in database");
      throw new Error("User not found in database");
    }

    if (repostId) {
      const originalPost = await Post.findById(repostId);
      if (!originalPost) {
        console.error("Original post not found");
        throw new Error("Original post not found");
      }

      // Create repost in the database
      const body: AddPostRequestBody = {
        user: userDB,
        text: `REPOSTED:\n${originalPost.text}`, // Add "Repost:" prefix
        imageUrl: originalPost.imageUrl || undefined, // Reuse image
      };

      await Post.create(body);
    } else if (postInput) {
      if (image && image.size > 0) {
        try {
          // 1. Upload image if there is one --MS Blob storage
          console.log("Uploading image to Azure Blob Storage...", image);

          const accountName = process.env.AZURE_STORAGE_NAME;

          const timestamp = new Date().getTime();
          const file_name = `${randomUUID()}_${timestamp}.png`;

          const sasToken = await generateSASTokenForBlob(file_name);

          const blockBlobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${file_name}?${sasToken}`;

          const blockBlobClient = new BlockBlobClient(blockBlobUrl);

          const imageBuffer = await image.arrayBuffer();
          await blockBlobClient.uploadData(imageBuffer);

          image_url = file_name;

          console.log("File uploaded successfully!", image_url);
        } catch (error) {
          console.error(`Failed to upload image: ${error}`);
        }

        // 2. create post in database with image

        const body: AddPostRequestBody = {
          user: userDB,
          text: postInput,
          ...(image_url && { imageUrl: image_url }),
        };

        await Post.create(body);
      } else {
        // 1. create post in database without image
        const body: AddPostRequestBody = {
          user: userDB,
          text: postInput,
        };

        await Post.create(body);
      }
    }

    // revalidatePath '/' - home page
    revalidatePath("/");
  } catch (error) {
    console.log("Failed to create post", error);
  }

  // revalidatePath '/' - home page
  revalidatePath("/");
}
