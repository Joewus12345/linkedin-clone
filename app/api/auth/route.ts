// import { auth } from "@clerk/nextjs/server";
import connectDB from "@/mongodb/db";
import { User } from "@/mongodb/models/user";
import { NextResponse } from "next/server";
import { IUserExtended } from "@/types/user";

export async function POST(request: Request) {
  // auth.protect();
  try {
    await connectDB();
    const user: IUserExtended = await request.json();

    console.log("Received user data:", user);

    const email =
      typeof user.email === "string" ? user.email : user.email?.address || "";

    // Check if user already exists
    const existingUser = await User.findOne({ userId: user.userId });

    if (existingUser) {
      // Check if the user's data is outdated
      const isUpdated =
        existingUser.firstName !== user.firstName ||
        existingUser.lastName !== user.lastName ||
        existingUser.userImage !== user.userImage;

      if (isUpdated) {
        // Update only if needed
        existingUser.firstName = user.firstName;
        existingUser.lastName = user.lastName;
        existingUser.userImage = user.userImage;
        await existingUser.save();

        console.log("User profile updated successfully", existingUser);
        return NextResponse.json(
          {
            message: "User profile updated successfully",
            user: existingUser,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { message: "User already exists and is up-to-date" },
        { status: 200 }
      );
    }

    // Create new user
    const newUser = new User({
      userId: user.userId,
      userImage: user.userImage || "",
      firstName: user.firstName,
      lastName: user.lastName || "",
      email: email,
    });

    await newUser.save();
    console.log("User registered successfully", newUser);

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering/updating user:", error);
    return NextResponse.json(
      { error: `Server error ${error}` },
      { status: 500 }
    );
  }
}
