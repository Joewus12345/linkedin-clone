"use server";

import { AddPostRequestBody } from "@/app/api/posts/route";
import generateSASToken, { containerName } from "@/lib/generateSASToken";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { IUserDocument, User } from "@/mongodb/models/user";
import { BlobServiceClient } from "@azure/storage-blob";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";

export default async function createPostAction(formData: FormData) {
  const user = await currentUser();
  const postInput = formData.get("postInput") as string;
  const repostId = formData.get("repostId") as string | null;
  const image = formData.get("image") as File;
  let image_url: string | undefined = undefined;

  if (!user?.id) {
    toast.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  // ....com/api/posts

  try {
    await connectDB();

    const userDB: IUserDocument | null = await User.findOne({ userId: user.id });

    if (userDB) {
      userDB.userImage = user.imageUrl;
      userDB.firstName = user.firstName || "";
      userDB.lastName = user.lastName || "";
    }

    if (!userDB) {
      toast.error("User not found in database");
      throw new Error("User not found in database");
    }

    if (repostId) {
      const originalPost = await Post.findById(repostId);
      if (!originalPost) {
        toast.error("Original post not found");
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

          const sasToken = await generateSASToken();

          const blobServiceClient = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net?${sasToken}`
          );

          const containerClient =
            blobServiceClient.getContainerClient(containerName);

          const timestamp = new Date().getTime();
          const file_name = `${randomUUID()}_${timestamp}.png`;

          const blockBlobClient = containerClient.getBlockBlobClient(file_name);

          const imageBuffer = await image.arrayBuffer();
          await blockBlobClient.uploadData(imageBuffer);
          image_url = blockBlobClient.url;

          console.log("File uploaded successfully!", image_url);
        } catch (error) {
          toast.error("Failed to upload image");
          toast.error(`Failed to upload image: ${error}`);
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
    toast.error("Failed to create post");
    console.log("Failed to create post", error);
  }

  // revalidatePath '/' - home page
  revalidatePath("/");
}
