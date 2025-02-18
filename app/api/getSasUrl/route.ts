import generateSASTokenForBlob from "@/lib/generateSASToken";
import { NextRequest, NextResponse } from "next/server";

// API route to fetch a fresh SAS token for an image blob.

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json(
        { error: "Missing fileName parameter" },
        { status: 400 }
      );
    }

    const sasToken = await generateSASTokenForBlob(fileName);

    const blobUrl = `https://${process.env.AZURE_STORAGE_NAME}.blob.core.windows.net/posts/${fileName}?${sasToken}`;

    return NextResponse.json({ url: blobUrl });
  } catch (error) {
    console.error("Failed to generate SAS token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
